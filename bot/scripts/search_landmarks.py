#!/usr/bin/env python3
"""Search CoM landmarks & places of interest — places of worship, schools,
health services, community use venues, place of assembly, etc.

Usage:
    python search_landmarks.py \\
        --query "mosque for Friday prayer" \\
        --postcode 3031 \\
        --theme "Place of Worship" \\
        --radius-km 5 \\
        --limit 5

Output: JSON {count, results: [...]} to stdout.
"""

from __future__ import annotations

import argparse

from _cli_common import setup_path, run

setup_path()
from lib.db import search_landmarks  # noqa: E402


def main() -> dict:
    p = argparse.ArgumentParser()
    p.add_argument("--query", required=True)
    p.add_argument("--postcode", required=True)
    p.add_argument(
        "--theme",
        help=(
            "Optional theme filter. Known themes: 'Place of Worship', "
            "'Education Centre', 'Health Services', 'Community Use', "
            "'Place of Assembly', 'Leisure/Recreation', 'Transport'."
        ),
    )
    p.add_argument("--radius-km", type=float, default=5.0)
    p.add_argument("--limit", type=int, default=5)
    args = p.parse_args()

    results = search_landmarks(
        semantic_query=args.query,
        user_postcode=args.postcode,
        radius_km=args.radius_km,
        theme=args.theme,
        limit=args.limit,
    )
    return {"count": len(results), "results": results}


if __name__ == "__main__":
    run(main)
