#!/usr/bin/env python3
"""Search community profiles — people in the Tapestry database.

Usage:
    python search_profiles.py \\
        --query "AHPRA nursing mentor" \\
        --postcode 3031 \\
        --languages en,fa,ps \\
        --occupation "engineer,structural" \\
        --radius-km 15 \\
        --limit 5

Output: JSON {count, results: [...]} to stdout.
"""

from __future__ import annotations

import argparse

from _cli_common import setup_path, parse_csv, parse_languages, run

setup_path()
from lib.db import search_profiles  # noqa: E402


def main() -> dict:
    p = argparse.ArgumentParser()
    p.add_argument("--query", required=True, help="Natural-language need.")
    p.add_argument("--postcode", required=True, help="Asker's 4-digit postcode.")
    p.add_argument("--languages", help="Comma-separated ISO codes of asker (e.g. 'en,fa,ps').")
    p.add_argument("--occupation", help="Comma-separated occupation keywords (e.g. 'nurse').")
    p.add_argument("--radius-km", type=float, default=5.0)
    p.add_argument("--limit", type=int, default=5)
    args = p.parse_args()

    results = search_profiles(
        semantic_query=args.query,
        user_postcode=args.postcode,
        radius_km=args.radius_km,
        asker_languages=parse_languages(args.languages),
        occupation_keywords=parse_csv(args.occupation),
        limit=args.limit,
    )
    return {"count": len(results), "results": results}


if __name__ == "__main__":
    run(main)
