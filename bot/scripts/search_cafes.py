#!/usr/bin/env python3
"""Search cafes/restaurants — CoM CLUE register, with indoor+outdoor seat counts.

Usage:
    python search_cafes.py \\
        --query "lunch spot for a 1-on-1" \\
        --postcode 3031 \\
        --min-seats 30 \\
        --radius-km 5 \\
        --limit 5

Output: JSON {count, results: [...]} to stdout.
"""

from __future__ import annotations

import argparse

from _cli_common import setup_path, run

setup_path()
from lib.db import search_cafes  # noqa: E402


def main() -> dict:
    p = argparse.ArgumentParser()
    p.add_argument("--query", required=True)
    p.add_argument("--postcode", required=True)
    p.add_argument("--min-seats", type=int, help="Optional minimum total seat count.")
    p.add_argument("--radius-km", type=float, default=5.0)
    p.add_argument("--limit", type=int, default=5)
    args = p.parse_args()

    results = search_cafes(
        semantic_query=args.query,
        user_postcode=args.postcode,
        radius_km=args.radius_km,
        min_seats=args.min_seats,
        limit=args.limit,
    )
    return {"count": len(results), "results": results}


if __name__ == "__main__":
    run(main)
