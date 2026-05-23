#!/usr/bin/env python3
"""Create or update a community profile, keyed by phone number.

Use this script when the user shares profile info during conversation —
e.g. when they tell the bot their name, postcode, languages, what they're
looking for. The script merges those fields into their profile (creating a
new one if the phone isn't yet known).

Usage examples:

    # First-touch profile for an anonymous user — just the phone
    python upsert_profile.py --phone 61499000000

    # Adding fields as they're shared
    python upsert_profile.py \\
        --phone 61499000000 \\
        --name "Ahmed" \\
        --postcode 3031 \\
        --languages "en,ar,am" \\
        --country-of-origin "Sudan" \\
        --occupation "secondary maths teacher" \\
        --looking-for "VIT teacher registration help"

    # Free-text background / interests / offering can be appended
    python upsert_profile.py \\
        --phone 61499000000 \\
        --interests "soccer, learning Aussie English"

Notes:
- NEW profiles default `opt_in_matching` to FALSE — they will NOT show up in
  search_community_profiles results until they explicitly opt in. Use
  --opt-in to set true after the user agrees.
- Any field not passed is left as-is (merge semantics).
- The profile embedding cache is invalidated automatically so the next
  retrieval call rebuilds it.

Output: JSON of the resulting profile to stdout.
"""

from __future__ import annotations

import argparse

from _cli_common import setup_path, parse_languages, run

setup_path()
from lib.db import upsert_profile_by_phone, resolve_postcode  # noqa: E402


def main() -> dict:
    p = argparse.ArgumentParser()
    p.add_argument("--phone", required=True)
    p.add_argument("--name")
    p.add_argument("--email")
    p.add_argument("--age", type=int)
    p.add_argument("--postcode", help="If supplied, also fills suburb / lat / lng from the lookup table.")
    p.add_argument("--suburb")
    p.add_argument("--country-of-origin", dest="country_of_origin")
    p.add_argument("--languages", help="Comma-separated ISO codes (e.g. 'en,ar,am').")
    p.add_argument("--occupation")
    p.add_argument("--background", help="Free-text background paragraph.")
    p.add_argument("--interests", help="Free-text interests.")
    p.add_argument("--offering", help="Free-text 'what I can offer the community'.")
    p.add_argument("--looking-for", dest="looking_for", help="Free-text current need.")
    p.add_argument("--opt-in", dest="opt_in", action="store_true",
                   help="Set opt_in_matching=true (default false on new profiles).")
    p.add_argument("--opt-out", dest="opt_out", action="store_true",
                   help="Set opt_in_matching=false explicitly.")
    args = p.parse_args()

    updates: dict = {}
    for field in (
        "name", "email", "age", "suburb", "country_of_origin",
        "occupation", "background", "interests", "offering", "looking_for",
    ):
        value = getattr(args, field, None)
        if value not in (None, ""):
            updates[field] = value

    if args.languages:
        langs = parse_languages(args.languages)
        if langs:
            updates["languages"] = langs

    if args.postcode:
        updates["postcode"] = args.postcode
        try:
            lat, lng = resolve_postcode(args.postcode)
            updates.setdefault("lat", lat)
            updates.setdefault("lng", lng)
        except ValueError:
            # Postcode not in our centroid lookup; store anyway, lat/lng absent.
            pass

    if args.opt_in:
        updates["opt_in_matching"] = True
    elif args.opt_out:
        updates["opt_in_matching"] = False

    return upsert_profile_by_phone(args.phone, updates)


if __name__ == "__main__":
    run(main)
