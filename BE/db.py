"""In-memory 'database' for profiles and businesses.

On first import, loads the seed JSON files, embeds each record's narrative text
with OpenAI, and caches the resulting embedded records to disk so subsequent
runs are instant.

Exposes two search functions matching the hybrid retrieval pattern described
in the README:

  1. Programmatic pre-filter (radius via Haversine; language overlap;
     occupation keyword match; opt-in gate).
  2. Semantic rank — cosine similarity between the query embedding and the
     surviving candidate embeddings.

No external DB. NumPy does the matrix math.
"""

from __future__ import annotations

import json
import math
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable

import numpy as np

from embeddings import embed, embed_one

_DATA_DIR = Path(__file__).parent / "data"
_PROFILES_RAW = _DATA_DIR / "profiles.json"
_BUSINESSES_RAW = _DATA_DIR / "businesses.json"
_EVENTS_RAW = _DATA_DIR / "events.json"
_PROFILES_EMBEDDED = _DATA_DIR / "profiles.embedded.json"
_BUSINESSES_EMBEDDED = _DATA_DIR / "businesses.embedded.json"
_EVENTS_EMBEDDED = _DATA_DIR / "events.embedded.json"

# Bump this any time the narrative shape changes. Cached embeddings tagged with
# a different version are discarded and rebuilt automatically.
_NARRATIVE_VERSION = "v2-query-register"

# Melbourne is AEST (UTC+10). The seed events use +10:00 offsets.
_MELBOURNE_TZ = timezone(timedelta(hours=10))

# Populated lazily by _ensure_loaded().
_profiles: list[dict[str, Any]] = []
_profile_embeddings: np.ndarray | None = None
_businesses: list[dict[str, Any]] = []
_business_embeddings: np.ndarray | None = None
_events: list[dict[str, Any]] = []
_event_embeddings: np.ndarray | None = None


# ---------------------------------------------------------------------------
# narrative builders — what text actually gets embedded
# ---------------------------------------------------------------------------

def _profile_narrative(p: dict[str, Any]) -> str:
    """Build a profile narrative in *query register*.

    Why this shape: typical user queries are need-statements ("mentor for an
    Afghan engineer", "help with AHPRA"). To align embeddings, the document
    leads with what the person OFFERS and what they're SEEKING — matching the
    grammar of the queries it'll be matched against. Identity comes second.
    A 'searchable topics' tail boosts recall on keyword-style queries.
    """
    langs = ", ".join(p.get("languages", []))
    return (
        f"OFFERS: {p['offering']}\n"
        f"SEEKS: {p.get('interests', '')}\n"
        f"CAN HELP WITH: experience as a {p['occupation']}; "
        f"background as a {p.get('country_of_origin', 'migrant')} arrival to Melbourne; "
        f"conversation in {langs}.\n"
        f"\n"
        f"ABOUT THE PERSON: {p['name']}, age {p['age']}, in {p['suburb']} "
        f"(postcode {p['postcode']}). From {p.get('country_of_origin', 'unknown')}. "
        f"Speaks {langs}. Works as: {p['occupation']}. {p['background']}\n"
        f"\n"
        f"SEARCHABLE TOPICS: {p['occupation']}, {p.get('country_of_origin', '')}, "
        f"{langs}, migration mentorship, peer support, credential recognition, "
        f"settlement, community connection, Melbourne newcomer support."
    )


def _business_narrative(b: dict[str, Any]) -> str:
    """Build a business narrative in *query register*.

    Leads with what the place HELPS WITH, mirroring queries like 'where can
    I get tax help' or 'place for new arrivals'. Identity is secondary.
    """
    types = ", ".join(b.get("types", []))
    overview = b.get("editorial_summary", {}).get("overview", "")
    industry_desc = b.get("industry_anzsic4_description", "")
    suburb = b.get("clue_small_area") or "Melbourne"
    return (
        f"HELPS WITH: {overview}\n"
        f"TYPE OF PLACE: {industry_desc or types}\n"
        f"\n"
        f"IDENTITY: {b['name']}, at {b['formatted_address']}. "
        f"Located in {suburb}.\n"
        f"\n"
        f"SEARCHABLE TOPICS: {types}, {industry_desc}, {suburb} businesses, "
        f"local services, community amenities."
    )


def _event_narrative(e: dict[str, Any]) -> str:
    """Build an event narrative in *query register*.

    Leads with what the event HELPS WITH — mirroring queries like 'workshop
    for AHPRA prep' or 'free tax help'. Date and venue come second.
    """
    cats = ", ".join(e.get("categories", []))
    langs = ", ".join(e.get("languages", []))
    audience = e.get("audience_notes", "") or ""
    venue = e.get("venue", {}).get("name", "")
    suburb = e.get("venue", {}).get("suburb", "")
    cost_str = "Free." if e.get("is_free") else f"Cost: AUD {e.get('cost_aud', 0)}."
    reg_str = (
        "Registration required."
        if e.get("registration_required")
        else "No registration needed."
    )
    return (
        f"HELPS WITH: {e['description']}\n"
        f"TYPE OF EVENT: {cats}. Open to: {audience}\n"
        f"\n"
        f"IDENTITY: '{e['title']}' at {venue} in {suburb}, "
        f"starting {e['start_datetime']}. "
        f"Languages: {langs}. {cost_str} {reg_str}\n"
        f"\n"
        f"SEARCHABLE TOPICS: {cats}, {langs}, {suburb} events, free workshops, "
        f"community programs, migrant settlement, newcomer welcome."
    )


# ---------------------------------------------------------------------------
# load / embed / cache
# ---------------------------------------------------------------------------

def _record_key(r: dict[str, Any]) -> str:
    """Return the unique key for a record — `id` for profiles/events, `place_id` for businesses."""
    return r.get("id") or r["place_id"]


def _embed_records(records: list[dict[str, Any]], narrative_fn) -> list[dict[str, Any]]:
    texts = [narrative_fn(r) for r in records]
    vectors = embed(texts)
    out = []
    for record, narrative, vector in zip(records, texts, vectors):
        enriched = dict(record)
        enriched["_narrative"] = narrative
        enriched["_embedding"] = vector
        enriched["_narrative_version"] = _NARRATIVE_VERSION
        out.append(enriched)
    return out


def _load_or_embed(
    raw_path: Path,
    cached_path: Path,
    narrative_fn,
) -> list[dict[str, Any]]:
    """Load embedded records from cache if it's still valid; otherwise re-embed and persist.

    The cache is considered valid only if:
      - it exists and parses
      - it contains the same set of record IDs as the raw file
      - every cached record carries the current _NARRATIVE_VERSION
    Any narrative-shape change → bump _NARRATIVE_VERSION → automatic rebuild.
    """
    raw_records = json.loads(raw_path.read_text())

    if cached_path.exists():
        try:
            cached = json.loads(cached_path.read_text())
            cache_versions = {r.get("_narrative_version") for r in cached}
            same_ids = {_record_key(r) for r in cached} == {_record_key(r) for r in raw_records}
            current_version_only = cache_versions == {_NARRATIVE_VERSION}
            if same_ids and current_version_only and len(cached) == len(raw_records):
                return cached
        except (json.JSONDecodeError, KeyError):
            pass  # fall through and rebuild

    print(f"[db] Embedding {len(raw_records)} records from {raw_path.name} (one-time, narrative={_NARRATIVE_VERSION})...")
    embedded = _embed_records(raw_records, narrative_fn)
    cached_path.write_text(json.dumps(embedded, indent=2))
    return embedded


def _ensure_loaded() -> None:
    global _profiles, _profile_embeddings
    global _businesses, _business_embeddings
    global _events, _event_embeddings
    if _profiles and _businesses and _events:
        return

    _profiles = _load_or_embed(_PROFILES_RAW, _PROFILES_EMBEDDED, _profile_narrative)
    _businesses = _load_or_embed(_BUSINESSES_RAW, _BUSINESSES_EMBEDDED, _business_narrative)
    _events = _load_or_embed(_EVENTS_RAW, _EVENTS_EMBEDDED, _event_narrative)

    _profile_embeddings = np.array([p["_embedding"] for p in _profiles], dtype=np.float32)
    _business_embeddings = np.array([b["_embedding"] for b in _businesses], dtype=np.float32)
    _event_embeddings = np.array([e["_embedding"] for e in _events], dtype=np.float32)


# ---------------------------------------------------------------------------
# geographic + similarity helpers
# ---------------------------------------------------------------------------

def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance between two points in km."""
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _cosine_sim(query_vec: np.ndarray, doc_vecs: np.ndarray) -> np.ndarray:
    """Cosine similarity between a query vector and a stack of document vectors."""
    q = query_vec / (np.linalg.norm(query_vec) + 1e-12)
    d_norms = np.linalg.norm(doc_vecs, axis=1, keepdims=True) + 1e-12
    d = doc_vecs / d_norms
    return d @ q


# ---------------------------------------------------------------------------
# postcode → lat/lng (hand-rolled mini lookup for seed suburbs)
# ---------------------------------------------------------------------------

_POSTCODE_CENTROIDS: dict[str, tuple[float, float]] = {
    # Demo focus: Kensington and adjacent suburbs
    "3031": (-37.79570, 144.92760),  # Kensington / Flemington / Newmarket
    "3051": (-37.79950, 144.94790),  # North Melbourne
    "3003": (-37.80810, 144.94770),  # West Melbourne
    "3032": (-37.77730, 144.91680),  # Ascot Vale / Travancore
    # Other Melbourne postcodes (kept for flexibility)
    "3000": (-37.8136, 144.9631),    # Melbourne CBD
    "3011": (-37.8005, 144.9000),    # Footscray
    "3053": (-37.7995, 144.9685),    # Carlton
    "3056": (-37.7670, 144.9580),    # Brunswick
    "3121": (-37.8197, 145.0000),    # Richmond
    "3171": (-37.9489, 145.1469),    # Springvale
    "3175": (-37.9874, 145.2148),    # Dandenong
}


def resolve_postcode(postcode: str) -> tuple[float, float]:
    """Return (lat, lng) for a known postcode. Raises if unknown."""
    centroid = _POSTCODE_CENTROIDS.get(postcode)
    if centroid is None:
        raise ValueError(
            f"Postcode '{postcode}' is not in the demo lookup. "
            f"Known: {sorted(_POSTCODE_CENTROIDS)}. "
            f"Add it to _POSTCODE_CENTROIDS in db.py."
        )
    return centroid


# ---------------------------------------------------------------------------
# public search functions — the body of the tool handlers
# ---------------------------------------------------------------------------

def search_profiles(
    *,
    semantic_query: str,
    user_postcode: str,
    radius_km: float = 5.0,
    asker_languages: list[str] | None = None,
    occupation_keywords: list[str] | None = None,
    limit: int = 5,
) -> list[dict[str, Any]]:
    """Hybrid search over profiles.

    Pre-filter:
      - opt_in_matching == true
      - haversine distance ≤ radius_km
      - language INTERSECTION (if asker_languages provided): at least one
        of the asker's languages must overlap with the profile's languages.
        This guarantees they can communicate, without being so strict that
        English-as-common-language matches are excluded.
      - occupation_keywords (if provided): substring match on profile.occupation.
    Rank: cosine similarity over the embedded narrative.
    """
    _ensure_loaded()
    user_lat, user_lng = resolve_postcode(user_postcode)

    asker_lang_set = {l.lower() for l in (asker_languages or [])}

    # ----- programmatic pre-filter -----
    surviving: list[tuple[int, dict[str, Any], float]] = []  # (idx, record, distance_km)
    for idx, p in enumerate(_profiles):
        if not p.get("opt_in_matching", False):
            continue

        dist = _haversine_km(user_lat, user_lng, p["lat"], p["lng"])
        if dist > radius_km:
            continue

        if asker_lang_set:
            profile_langs = {l.lower() for l in p.get("languages", [])}
            if not (asker_lang_set & profile_langs):
                continue  # no shared language — exclude

        if occupation_keywords:
            occ_lower = p["occupation"].lower()
            if not any(kw.lower() in occ_lower for kw in occupation_keywords):
                continue

        surviving.append((idx, p, dist))

    if not surviving:
        return []

    # ----- semantic rank -----
    q_emb = np.array(embed_one(semantic_query), dtype=np.float32)
    candidate_vecs = np.stack([_profile_embeddings[i] for i, _, _ in surviving])
    sims = _cosine_sim(q_emb, candidate_vecs)

    ranked = sorted(
        zip(surviving, sims),
        key=lambda pair: pair[1],
        reverse=True,
    )[:limit]

    return [_render_profile(p, dist, float(sim)) for (_, p, dist), sim in ranked]


def search_businesses(
    *,
    semantic_query: str,
    user_postcode: str,
    radius_km: float = 5.0,
    business_type: str | None = None,
    limit: int = 5,
) -> list[dict[str, Any]]:
    """Hybrid search over businesses (Google Places-shaped records)."""
    _ensure_loaded()
    user_lat, user_lng = resolve_postcode(user_postcode)

    surviving: list[tuple[int, dict[str, Any], float]] = []
    for idx, b in enumerate(_businesses):
        b_lat = b["geometry"]["location"]["lat"]
        b_lng = b["geometry"]["location"]["lng"]
        dist = _haversine_km(user_lat, user_lng, b_lat, b_lng)
        if dist > radius_km:
            continue

        if business_type:
            types_lower = [t.lower() for t in b.get("types", [])]
            if business_type.lower() not in types_lower:
                continue

        surviving.append((idx, b, dist))

    if not surviving:
        return []

    q_emb = np.array(embed_one(semantic_query), dtype=np.float32)
    candidate_vecs = np.stack([_business_embeddings[i] for i, _, _ in surviving])
    sims = _cosine_sim(q_emb, candidate_vecs)

    ranked = sorted(
        zip(surviving, sims),
        key=lambda pair: pair[1],
        reverse=True,
    )[:limit]

    return [_render_business(b, dist, float(sim)) for (_, b, dist), sim in ranked]


def search_events(
    *,
    semantic_query: str,
    user_postcode: str,
    radius_km: float = 10.0,
    days_ahead: int = 30,
    asker_languages: list[str] | None = None,
    category: str | None = None,
    free_only: bool = False,
    limit: int = 5,
) -> list[dict[str, Any]]:
    """Hybrid search over upcoming events.

    Filters: date window (now → now + days_ahead, drops past events) +
    radius + (optional) language intersection + (optional) category +
    (optional) free_only.

    Language intersection: at least one of the asker's languages must appear
    in the event's `languages` list. Most events list English plus any
    interpreter languages, so this is permissive but excludes events with
    zero linguistic overlap.

    Events use a slightly wider default radius (10 km) than profiles/businesses
    because people will travel further for events than for everyday services.
    """
    _ensure_loaded()
    user_lat, user_lng = resolve_postcode(user_postcode)

    now = datetime.now(_MELBOURNE_TZ)
    window_end = now + timedelta(days=days_ahead)
    asker_lang_set = {l.lower() for l in (asker_languages or [])}

    surviving: list[tuple[int, dict[str, Any], float, datetime]] = []
    for idx, e in enumerate(_events):
        # parse ISO 8601 with timezone; fromisoformat handles +10:00 fine
        try:
            start = datetime.fromisoformat(e["start_datetime"])
        except (KeyError, ValueError):
            continue

        if start < now or start > window_end:
            continue

        venue = e.get("venue", {})
        e_lat = venue.get("lat")
        e_lng = venue.get("lng")
        if e_lat is None or e_lng is None:
            continue

        dist = _haversine_km(user_lat, user_lng, e_lat, e_lng)
        if dist > radius_km:
            continue

        if asker_lang_set:
            event_langs = {l.lower() for l in e.get("languages", [])}
            if not (asker_lang_set & event_langs):
                continue

        if category:
            cat_lower = [c.lower() for c in e.get("categories", [])]
            if category.lower() not in cat_lower:
                continue

        if free_only and not e.get("is_free", False):
            continue

        surviving.append((idx, e, dist, start))

    if not surviving:
        return []

    q_emb = np.array(embed_one(semantic_query), dtype=np.float32)
    candidate_vecs = np.stack([_event_embeddings[i] for i, _, _, _ in surviving])
    sims = _cosine_sim(q_emb, candidate_vecs)

    ranked = sorted(
        zip(surviving, sims),
        key=lambda pair: pair[1],
        reverse=True,
    )[:limit]

    return [_render_event(e, dist, start, float(sim)) for (_, e, dist, start), sim in ranked]


# ---------------------------------------------------------------------------
# renderers — strip internal fields, add presentation fields
# ---------------------------------------------------------------------------

def _render_profile(p: dict[str, Any], distance_km: float, similarity: float) -> dict[str, Any]:
    return {
        "id": p["id"],
        "name": p["name"],
        "age": p["age"],
        "suburb": p["suburb"],
        "postcode": p["postcode"],
        "country_of_origin": p.get("country_of_origin"),
        "languages": p.get("languages", []),
        "occupation": p["occupation"],
        "background": p["background"],
        "interests": p["interests"],
        "offering": p["offering"],
        "distance_km": round(distance_km, 2),
        "similarity": round(similarity, 4),
    }


def _render_business(b: dict[str, Any], distance_km: float, similarity: float) -> dict[str, Any]:
    return {
        "place_id": b["place_id"],
        "name": b["name"],
        "formatted_address": b["formatted_address"],
        "types": b.get("types", []),
        "rating": b.get("rating"),
        "user_ratings_total": b.get("user_ratings_total"),
        "business_status": b.get("business_status"),
        "opening_hours": b.get("opening_hours"),
        "formatted_phone_number": b.get("formatted_phone_number"),
        "website": b.get("website"),
        "editorial_summary": b.get("editorial_summary", {}).get("overview"),
        "distance_km": round(distance_km, 2),
        "similarity": round(similarity, 4),
    }


def _render_event(
    e: dict[str, Any],
    distance_km: float,
    start: datetime,
    similarity: float,
) -> dict[str, Any]:
    venue = e.get("venue", {})
    return {
        "id": e["id"],
        "title": e["title"],
        "description": e["description"],
        "start_datetime": e["start_datetime"],
        "end_datetime": e.get("end_datetime"),
        "days_from_now": (start - datetime.now(_MELBOURNE_TZ)).days,
        "venue_name": venue.get("name"),
        "venue_address": venue.get("address"),
        "suburb": venue.get("suburb"),
        "organizer": e.get("organizer"),
        "categories": e.get("categories", []),
        "languages": e.get("languages", []),
        "is_free": e.get("is_free", False),
        "cost_aud": e.get("cost_aud", 0),
        "registration_url": e.get("registration_url"),
        "registration_required": e.get("registration_required", False),
        "welcomes_newcomers": e.get("welcomes_newcomers", False),
        "audience_notes": e.get("audience_notes"),
        "recurring": e.get("recurring"),
        "source": e.get("source"),
        "distance_km": round(distance_km, 2),
        "similarity": round(similarity, 4),
    }
