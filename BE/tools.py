"""Tool schemas + handlers exposed to the Claude agent.

There are two tools:

  1. search_community_profiles — find people in the local community who match
     a need (occupation, language, skill).
  2. search_local_businesses — find businesses / community spaces / services
     (Google Places-shaped data).

The schemas are the contract between Claude and our code. Their descriptions
are the *prompt* — when Claude misuses a tool, fix the description first.
"""

from __future__ import annotations

from typing import Any

import db

# ---------------------------------------------------------------------------
# tool schemas (Anthropic tool-use format)
# ---------------------------------------------------------------------------

TOOL_SCHEMAS: list[dict[str, Any]] = [
    {
        "name": "search_community_profiles",
        "description": (
            "Search the local community profile database for opted-in residents "
            "who match specific criteria. Use this whenever the user is looking "
            "for a PERSON with particular skills, occupation, language, or "
            "background near a location — for example a mentor, a peer who has "
            "navigated the same migration journey, or someone offering help in "
            "a specific language. Returns up to 5 ranked matches.\n\n"
            "If the first search returns no results, retry once with a larger "
            "radius_km (e.g. 15 then 30) before telling the user nothing was found."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "semantic_query": {
                    "type": "string",
                    "description": (
                        "Natural-language description of what the user actually "
                        "needs help with — the substance, not the metadata. "
                        "Example: 'help preparing for AHPRA nursing assessment' "
                        "or 'mentor who has navigated Engineers Australia "
                        "migrant skill assessment'. Do NOT include location, "
                        "language, or profession here — those have their own "
                        "fields."
                    ),
                },
                "user_postcode": {
                    "type": "string",
                    "description": (
                        "The asker's 4-digit Australian postcode. Required for "
                        "distance filtering."
                    ),
                },
                "radius_km": {
                    "type": "number",
                    "description": (
                        "Search radius in kilometres. Default 5. Expand to 15 "
                        "or 30 on retry if the first search returns nothing."
                    ),
                    "default": 5,
                },
                "asker_languages": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": (
                        "ALL languages the asker speaks, as ISO-639-1 codes — "
                        "pulled directly from the ASKER PROFILE in the system "
                        "prompt. Always pass this if the asker has declared "
                        "languages. The tool uses INTERSECTION semantics: a "
                        "profile is only returned if it shares at least one "
                        "language with the asker. Because most people list "
                        "English, this is a permissive filter that mainly "
                        "excludes profiles with zero linguistic overlap. "
                        "Example: if asker speaks English, Farsi, Pashto pass "
                        "['en','fa','ps']."
                    ),
                },
                "occupation_keywords": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": (
                        "Optional. Plain-English profession terms (e.g. "
                        "['nurse'], ['engineer', 'structural'], ['teacher']). "
                        "Only include if the user is asking for a specific "
                        "profession."
                    ),
                },
            },
            "required": ["semantic_query", "user_postcode"],
        },
    },
    {
        "name": "search_local_businesses",
        "description": (
            "Search local businesses, community spaces, and services near a "
            "location. Use this when the user is looking for a PLACE — a "
            "library, community centre, settlement service, tool library, "
            "support service, or similar. Returns up to 5 ranked matches with "
            "Google Maps-style detail (address, opening hours, phone, website, "
            "rating).\n\n"
            "Prefer this tool over search_community_profiles when the user "
            "wants 'where can I go' or 'what's near me' rather than 'who can "
            "help me'."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "semantic_query": {
                    "type": "string",
                    "description": (
                        "Natural-language description of the kind of place the "
                        "user is looking for. Example: 'community centre that "
                        "runs free English classes' or 'tool library where I "
                        "can borrow a drill'. Do NOT include location here."
                    ),
                },
                "user_postcode": {
                    "type": "string",
                    "description": "The asker's 4-digit Australian postcode.",
                },
                "radius_km": {
                    "type": "number",
                    "description": (
                        "Search radius in kilometres. Default 5. Expand to 15 "
                        "or 30 on retry."
                    ),
                    "default": 5,
                },
                "business_type": {
                    "type": "string",
                    "description": (
                        "Optional Google Places-style type filter, e.g. "
                        "'library', 'community_center', 'non_profit', "
                        "'art_gallery'. Only include if the user is explicit."
                    ),
                },
            },
            "required": ["semantic_query", "user_postcode"],
        },
    },
    {
        "name": "search_community_events",
        "description": (
            "Search UPCOMING community events near a location — workshops, "
            "info sessions, cultural festivals, language circles, repair "
            "cafes, professional development, women's groups, markets. Use "
            "this when the user wants something HAPPENING SOON, or asks "
            "'what's on', 'is there an event', 'workshop', 'session', "
            "'class', 'meeting', 'market', or anything time-bound.\n\n"
            "Events are filtered to a forward time window — past events are "
            "never returned. Default window is 30 days. Returns up to 5 "
            "ranked matches with title, datetime, venue, languages, free/paid "
            "status, audience notes, and registration link.\n\n"
            "Frequently good to call ALONGSIDE search_community_profiles or "
            "search_local_businesses — e.g. the user wants both a mentor AND "
            "an upcoming info session on the same topic. In that case call "
            "both tools in the same turn."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "semantic_query": {
                    "type": "string",
                    "description": (
                        "Natural-language description of the kind of event "
                        "the user is interested in. Example: 'AHPRA "
                        "preparation', 'repair cafe', 'free tax help', "
                        "'cultural festival'. Do NOT include location, date, "
                        "or language — those have their own fields."
                    ),
                },
                "user_postcode": {
                    "type": "string",
                    "description": "The asker's 4-digit Australian postcode.",
                },
                "radius_km": {
                    "type": "number",
                    "description": (
                        "Search radius in kilometres. Default 10 (people "
                        "travel further for events than for services). Expand "
                        "to 25 or 50 on retry."
                    ),
                    "default": 10,
                },
                "days_ahead": {
                    "type": "integer",
                    "description": (
                        "How many days ahead to look. Default 30. Narrow to "
                        "7 if the user says 'this week' or similar; widen to "
                        "60+ if the user says 'in the next couple of months'."
                    ),
                    "default": 30,
                },
                "asker_languages": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": (
                        "ALL languages the asker speaks, as ISO-639-1 codes — "
                        "pulled directly from the ASKER PROFILE in the system "
                        "prompt. Always pass this if the asker has declared "
                        "languages. INTERSECTION semantics: only events that "
                        "share at least one language with the asker are "
                        "returned. Most events list English plus any "
                        "interpreter languages, so this is a permissive "
                        "filter."
                    ),
                },
                "category": {
                    "type": "string",
                    "description": (
                        "Optional category filter. Known categories include: "
                        "'health', 'professional', 'settlement', "
                        "'credential_recognition', 'language', 'cultural', "
                        "'community', 'family', 'women', 'financial', "
                        "'circular_economy', 'skill_share', 'market'. Use only "
                        "when the user is explicit about the kind of event."
                    ),
                },
                "free_only": {
                    "type": "boolean",
                    "description": (
                        "If true, only return events with no cost. Default "
                        "false. Set true if the user mentions money concerns "
                        "or asks for free events."
                    ),
                    "default": False,
                },
            },
            "required": ["semantic_query", "user_postcode"],
        },
    },
]


# ---------------------------------------------------------------------------
# handlers — keyed by tool name so the agent loop can dispatch
# ---------------------------------------------------------------------------

def _handle_search_community_profiles(args: dict[str, Any]) -> dict[str, Any]:
    results = db.search_profiles(
        semantic_query=args["semantic_query"],
        user_postcode=args["user_postcode"],
        radius_km=float(args.get("radius_km", 5)),
        asker_languages=args.get("asker_languages"),
        occupation_keywords=args.get("occupation_keywords"),
    )
    return {"count": len(results), "results": results}


def _handle_search_local_businesses(args: dict[str, Any]) -> dict[str, Any]:
    results = db.search_businesses(
        semantic_query=args["semantic_query"],
        user_postcode=args["user_postcode"],
        radius_km=float(args.get("radius_km", 5)),
        business_type=args.get("business_type"),
    )
    return {"count": len(results), "results": results}


def _handle_search_community_events(args: dict[str, Any]) -> dict[str, Any]:
    results = db.search_events(
        semantic_query=args["semantic_query"],
        user_postcode=args["user_postcode"],
        radius_km=float(args.get("radius_km", 10)),
        days_ahead=int(args.get("days_ahead", 30)),
        asker_languages=args.get("asker_languages"),
        category=args.get("category"),
        free_only=bool(args.get("free_only", False)),
    )
    return {"count": len(results), "results": results}


HANDLERS = {
    "search_community_profiles": _handle_search_community_profiles,
    "search_local_businesses": _handle_search_local_businesses,
    "search_community_events": _handle_search_community_events,
}


def dispatch(tool_name: str, args: dict[str, Any]) -> dict[str, Any]:
    """Look up the handler for `tool_name` and run it with the given args."""
    handler = HANDLERS.get(tool_name)
    if handler is None:
        return {"error": f"Unknown tool: {tool_name}"}
    try:
        return handler(args)
    except Exception as exc:  # surface error to the model rather than crash
        return {"error": f"{type(exc).__name__}: {exc}"}
