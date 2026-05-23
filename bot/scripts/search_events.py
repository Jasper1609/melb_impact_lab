#!/usr/bin/env python3
"""Search upcoming community events — workshops, info sessions, festivals,
language circles, repair cafes, markets.

Usage:
    python search_events.py \\
        --query "AHPRA preparation workshop" \\
        --postcode 3031 \\
        --languages en,fa,ps \\
        --category credential_recognition \\
        --days-ahead 30 \\
        --free-only \\
        --radius-km 10 \\
        --limit 5

Output: JSON {count, results: [...]} to stdout.
"""

from __future__ import annotations

import argparse

from _cli_common import setup_path, parse_languages, run

setup_path()
from lib.db import search_events  # noqa: E402


def main() -> dict:
    p = argparse.ArgumentParser()
    p.add_argument("--query", required=True)
    p.add_argument("--postcode", required=True)
    p.add_argument("--languages", help="Comma-separated ISO codes (e.g. 'en,fa,ps').")
    p.add_argument(
        "--category",
        help=(
            "Optional category filter. Known: 'health', 'professional', "
            "'settlement', 'credential_recognition', 'language', 'cultural', "
            "'community', 'family', 'women', 'financial', 'circular_economy', "
            "'skill_share', 'market'."
        ),
    )
    p.add_argument("--days-ahead", type=int, default=30)
    p.add_argument("--free-only", action="store_true")
    p.add_argument("--radius-km", type=float, default=10.0)
    p.add_argument("--limit", type=int, default=5)
    args = p.parse_args()

    results = search_events(
        semantic_query=args.query,
        user_postcode=args.postcode,
        radius_km=args.radius_km,
        days_ahead=args.days_ahead,
        asker_languages=parse_languages(args.languages),
        category=args.category,
        free_only=args.free_only,
        limit=args.limit,
    )
    return {"count": len(results), "results": results}


if __name__ == "__main__":
    run(main)
