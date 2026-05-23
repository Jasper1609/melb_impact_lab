#!/usr/bin/env python3
"""Search local businesses — CoM CLUE register, ~1.8k Kensington-cluster records.

Usage:
    python search_businesses.py \\
        --query "accountant for ABN and tax help" \\
        --postcode 3031 \\
        --type accounting \\
        --radius-km 5 \\
        --limit 5

Output: JSON {count, results: [...]} to stdout.
"""

from __future__ import annotations

import argparse

from _cli_common import setup_path, run

setup_path()
from lib.db import search_businesses  # noqa: E402


def main() -> dict:
    p = argparse.ArgumentParser()
    p.add_argument("--query", required=True)
    p.add_argument("--postcode", required=True)
    p.add_argument("--type", dest="business_type", help="Optional Google Places-style type filter (e.g. accounting, bakery).")
    p.add_argument("--radius-km", type=float, default=5.0)
    p.add_argument("--limit", type=int, default=5)
    args = p.parse_args()

    results = search_businesses(
        semantic_query=args.query,
        user_postcode=args.postcode,
        radius_km=args.radius_km,
        business_type=args.business_type,
        limit=args.limit,
    )
    return {"count": len(results), "results": results}


if __name__ == "__main__":
    run(main)
