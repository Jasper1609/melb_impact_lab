"""One-time data prep — produces BE/data/{businesses,cafes,landmarks}.json from
the raw CoM Open Data snapshots in `../data/datasets/`.

Run once after `python data/fetch_datasets.py` has produced the raw files. The
output JSONs are committed to git so consumers of BE can just `python main.py`
without any prep step. Re-run this script when the raw CoM data refreshes or
when you want to change the CLUE-area scope.

Filtering rules:
  - businesses + cafes: latest census year only (2024), inner-west cluster
    (Kensington / North Melbourne / West Melbourne), non-null trading_name,
    exclude 'Vacant Space' rows.
  - landmarks: keep all 242 records (already a curated CoM list); only
    project the field shape into ours.

Usage:
    python prepare_data.py
"""

from __future__ import annotations

import json
import re
from collections import OrderedDict
from collections.abc import Iterable
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# paths
# ---------------------------------------------------------------------------

BE_DIR = Path(__file__).parent
REPO_ROOT = BE_DIR.parent
RAW_DIR = REPO_ROOT / "data" / "datasets"
OUT_DIR = BE_DIR / "data"

RAW_BUSINESSES = (
    RAW_DIR / "local_businesses_shops" / "business-establishments-with-address-and-industry-classification.json"
)
RAW_CAFES = RAW_DIR / "food_hospitality" / "cafes-and-restaurants-with-seating-capacity.json"
RAW_LANDMARKS = (
    RAW_DIR
    / "community_facilities"
    / "landmarks-and-places-of-interest-including-schools-theatres-health-services-spor.json"
)

OUT_BUSINESSES = OUT_DIR / "businesses.json"
OUT_CAFES = OUT_DIR / "cafes.json"
OUT_LANDMARKS = OUT_DIR / "landmarks.json"

# CLUE small areas to keep — Kensington-cluster only, CBD excluded for demo focus.
TARGET_CLUE_AREAS = {
    "Kensington",
    "North Melbourne",
    "West Melbourne (Residential)",
    "West Melbourne (Industrial)",
}
LATEST_CENSUS_YEAR = "2024"


# ---------------------------------------------------------------------------
# small helpers
# ---------------------------------------------------------------------------


def _slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", (text or "").lower()).strip("_")[:60]


def _types_from_anzsic(desc: str) -> list[str]:
    """Map a free-text ANZSIC industry description to a small list of types
    our embedding narrative + tool filter can use.
    """
    if not desc:
        return ["business"]
    d = desc.lower()
    tags: list[str] = []
    if "cafe" in d or "restaurant" in d:
        tags += ["cafe", "restaurant", "food"]
    if "takeaway" in d:
        tags += ["takeaway", "food"]
    if "bakery" in d or "bread manufacturing" in d:
        tags += ["bakery", "food"]
    if "pub" in d or "tavern" in d or "bar" in d:
        tags += ["pub", "bar", "drink"]
    if "hairdressing" in d or "beauty" in d:
        tags += ["hair", "beauty", "personal_services"]
    if "medical" in d or "general practice" in d or "physiotherapy" in d:
        tags += ["health", "medical"]
    if "pharmacy" in d:
        tags += ["pharmacy", "health"]
    if "childcare" in d:
        tags += ["childcare", "family"]
    if "accounting" in d:
        tags += ["accounting", "professional_services"]
    if "legal" in d or "solicitor" in d:
        tags += ["legal", "professional_services"]
    if "engineering" in d:
        tags += ["engineering", "professional_services"]
    if "education" in d or "tutoring" in d or "school" in d:
        tags += ["education"]
    if "religious" in d or "worship" in d:
        tags += ["religious", "community"]
    if "social assistance" in d or "community service" in d:
        tags += ["community_services", "settlement"]
    if "real estate" in d or "property" in d:
        tags += ["real_estate"]
    if "grocery" in d or "supermarket" in d or "convenience store" in d:
        tags += ["grocery", "food"]
    if "wholesaling" in d:
        tags += ["wholesale"]
    if "manufacturing" in d:
        tags += ["manufacturing"]
    if "construction" in d or "concreting" in d or "plumbing" in d or "electrical services" in d:
        tags += ["trade_services"]
    if "transport" in d or "logistics" in d:
        tags += ["transport"]
    if not tags:
        tags = ["business"]
    # de-dupe while preserving order
    seen: set[str] = set()
    return [t for t in tags if not (t in seen or seen.add(t))]


def _parse_coord(
    record: dict[str, Any], lat_key: str = "latitude", lng_key: str = "longitude"
) -> tuple[float, float] | None:
    """Pull lat/lng out of a record. Returns None if either is missing/invalid."""
    try:
        lat = float(record[lat_key])
        lng = float(record[lng_key])
    except (KeyError, TypeError, ValueError):
        return None
    if lat == 0 or lng == 0:
        return None
    return lat, lng


def _parse_coord_object(value: Any) -> tuple[float, float] | None:
    """Landmark dataset stores coords as a stringified dict. Parse it."""
    if isinstance(value, dict):
        lat = value.get("lat")
        lng = value.get("lon") or value.get("lng")
    else:
        # accept stringified dict
        try:
            obj = json.loads(str(value).replace("'", '"'))
            lat = obj.get("lat")
            lng = obj.get("lon") or obj.get("lng")
        except Exception:
            return None
    if lat is None or lng is None:
        return None
    return float(lat), float(lng)


# ---------------------------------------------------------------------------
# projectors
# ---------------------------------------------------------------------------


def project_businesses(records: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    seen_keys: set[str] = set()
    for r in records:
        if r.get("census_year") != LATEST_CENSUS_YEAR:
            continue
        if r.get("clue_small_area") not in TARGET_CLUE_AREAS:
            continue
        name = (r.get("trading_name") or "").strip()
        if not name:
            continue
        industry_desc = r.get("industry_anzsic4_description") or ""
        if "vacant space" in industry_desc.lower():
            continue
        coord = _parse_coord(r)
        if coord is None:
            continue
        lat, lng = coord
        # de-dupe businesses that appear at multiple ANZSIC codes by name+address
        addr = r.get("business_address") or ""
        dedupe_key = (name.lower(), addr.lower())
        if dedupe_key in seen_keys:
            continue
        seen_keys.add(dedupe_key)

        out.append(
            {
                "place_id": f"com_clue_{_slugify(name)}_{r.get('block_id', '')}_{r.get('property_id', '')}",
                "name": name,
                "formatted_address": addr,
                "geometry": {"location": {"lat": lat, "lng": lng}},
                "types": _types_from_anzsic(industry_desc),
                "rating": None,
                "user_ratings_total": None,
                "business_status": "OPERATIONAL",
                "opening_hours": None,
                "formatted_phone_number": None,
                "website": None,
                "price_level": None,
                "editorial_summary": {"overview": f"{industry_desc} in {r.get('clue_small_area', 'inner Melbourne')}."},
                "industry_anzsic4_code": r.get("industry_anzsic4_code"),
                "industry_anzsic4_description": industry_desc,
                "clue_small_area": r.get("clue_small_area"),
                "census_year": r.get("census_year"),
                "source": "CoM CLUE - business-establishments-with-address-and-industry-classification",
            }
        )
    return out


def project_cafes(records: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Cafes have one record per seating_type — collapse so each business
    appears once with indoor+outdoor seat totals summed."""
    by_key: OrderedDict[tuple[str, str], dict[str, Any]] = OrderedDict()
    for r in records:
        if r.get("census_year") != LATEST_CENSUS_YEAR:
            continue
        if r.get("clue_small_area") not in TARGET_CLUE_AREAS:
            continue
        name = (r.get("trading_name") or "").strip()
        if not name:
            continue
        coord = _parse_coord(r)
        if coord is None:
            continue
        addr = r.get("business_address") or ""
        key = (name.lower(), addr.lower())
        seats = int(r.get("number_of_seats") or 0)
        seating_type = (r.get("seating_type") or "").lower()
        if key in by_key:
            entry = by_key[key]
        else:
            lat, lng = coord
            entry = {
                "id": f"cafe_{_slugify(name)}_{r.get('block_id', '')}_{r.get('property_id', '')}",
                "name": name,
                "formatted_address": addr,
                "geometry": {"location": {"lat": lat, "lng": lng}},
                "industry_anzsic4_code": r.get("industry_anzsic4_code"),
                "industry_anzsic4_description": r.get("industry_anzsic4_description"),
                "clue_small_area": r.get("clue_small_area"),
                "census_year": r.get("census_year"),
                "seats_indoor": 0,
                "seats_outdoor": 0,
                "source": "CoM CLUE - cafes-and-restaurants-with-seating-capacity",
            }
            by_key[key] = entry
        if "indoor" in seating_type:
            entry["seats_indoor"] += seats
        elif "outdoor" in seating_type:
            entry["seats_outdoor"] += seats
    # derive total + handy display fields
    for entry in by_key.values():
        entry["seats_total"] = entry["seats_indoor"] + entry["seats_outdoor"]
    return list(by_key.values())


def project_landmarks(records: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for idx, r in enumerate(records):
        name = (r.get("feature_name") or "").strip()
        if not name:
            continue
        coord = _parse_coord_object(r.get("co_ordinates"))
        if coord is None:
            continue
        lat, lng = coord
        out.append(
            {
                "id": f"landmark_{idx:04d}_{_slugify(name)}",
                "feature_name": name,
                "theme": r.get("theme"),
                "sub_theme": r.get("sub_theme"),
                "lat": lat,
                "lng": lng,
                "source": "CoM Landmarks and Places of Interest",
            }
        )
    return out


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------


def _load(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(f"Raw CoM dataset not found: {path}\nRun `python data/fetch_datasets.py` first.")
    return json.loads(path.read_text())


def main() -> None:
    print(f"Reading raw datasets from: {RAW_DIR}")
    print(f"Target CLUE areas: {sorted(TARGET_CLUE_AREAS)}")
    print(f"Latest census year: {LATEST_CENSUS_YEAR}")
    print()

    raw_biz = _load(RAW_BUSINESSES)
    raw_cafe = _load(RAW_CAFES)
    raw_land = _load(RAW_LANDMARKS)
    print(f"Raw counts: businesses={len(raw_biz):,}  cafes={len(raw_cafe):,}  landmarks={len(raw_land):,}")

    biz = project_businesses(raw_biz)
    cafe = project_cafes(raw_cafe)
    land = project_landmarks(raw_land)
    print(f"After filter+project: businesses={len(biz):,}  cafes={len(cafe):,}  landmarks={len(land):,}")

    OUT_BUSINESSES.write_text(json.dumps(biz, indent=2))
    OUT_CAFES.write_text(json.dumps(cafe, indent=2))
    OUT_LANDMARKS.write_text(json.dumps(land, indent=2))
    print()
    print(f"Wrote: {OUT_BUSINESSES.relative_to(REPO_ROOT)}  ({OUT_BUSINESSES.stat().st_size // 1024} KB)")
    print(f"Wrote: {OUT_CAFES.relative_to(REPO_ROOT)}  ({OUT_CAFES.stat().st_size // 1024} KB)")
    print(f"Wrote: {OUT_LANDMARKS.relative_to(REPO_ROOT)}  ({OUT_LANDMARKS.stat().st_size // 1024} KB)")
    print()
    print("Remember to delete any stale .embedded.json files in BE/data/ — they")
    print("will be auto-rebuilt on next run of main.py / live_test.py.")


if __name__ == "__main__":
    main()
