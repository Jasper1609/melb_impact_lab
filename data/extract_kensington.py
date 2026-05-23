#!/usr/bin/env python3
"""
Kensington Suburb Data Extractor
----------------------------------
Scans every downloaded dataset in the `./datasets` folder and extracts
records related to the Kensington suburb (postcode 3031).

Each dataset uses a slightly different field to encode location, so this
script applies a tailored matching strategy per file:

  • clue_small_area == "Kensington"
  • geography == "Kensington"
  • small_area == "Kensington"
  • precinct == "Kensington"
  • profile == "Kensington"  (workers profile)
  • respondent_group contains "Kensington"
  • building_address / business_address / venue_address contains "KENSINGTON" or "3031"
  • suburb contains "Kensington"
  • feature_name / name / title / location / address_point contains "Kensington"

Results are written to ./kensington/ as individual JSON files, one per
source dataset. A summary table is printed to stdout.

Usage:
    python3 extract_kensington.py
"""

import json
import os
import glob
import re
from pathlib import Path

# ── Configuration ──────────────────────────────────────────────────────────────

DATASETS_DIR = "./datasets"
OUTPUT_DIR = "./kensington"

# Postcode 3031 covers Kensington (and neighbouring Flemington).
# We include it as a secondary address signal.
POSTCODE = "3031"

# ── Helpers ────────────────────────────────────────────────────────────────────

def _matches_kensington(value: str) -> bool:
    """Return True if the string value strongly indicates Kensington suburb."""
    v = value.strip()
    # Exact suburb name (case-insensitive)
    if re.search(r'\bkensington\b', v, re.IGNORECASE):
        return True
    return False


def _address_matches(value: str) -> bool:
    """
    Return True if an address string belongs to Kensington.
    Accepts:  'KENSINGTON' as a suburb token, or postcode 3031.
    Rejects:  'Kensington Road' when the suburb is something else
              (e.g. West Melbourne) — checked by looking for the full token.
    """
    v = value.upper()
    # Postcode 3031 strongly implies Kensington / Flemington
    if re.search(r'\b3031\b', v):
        return True
    # Suburb token KENSINGTON (not part of a road name — road names are
    # typically followed by a street type token like RD/ROAD/ST/etc.)
    if re.search(r'\bKENSINGTON\b', v):
        # Exclude "KENSINGTON ROAD" when KENSINGTON is acting as a street name
        # (those addresses end with a different suburb, e.g. WEST MELBOURNE)
        # Heuristic: if the next token after KENSINGTON is ROAD/RD, skip.
        if re.search(r'\bKENSINGTON\s+(ROAD|RD|ST|STREET|AVE|AVENUE|DR|DRIVE|PL|PLACE|CT|COURT|LANE|LN)\b', v):
            return False
        return True
    return False


# ── Dataset extraction rules ───────────────────────────────────────────────────
# Each entry describes how to match Kensington records in a specific file.
# 'field' is the key to check; 'strategy' is one of:
#   'exact'   – field value must exactly equal "Kensington" (case-insensitive)
#   'contains'– field value must contain "Kensington" (case-insensitive)
#   'address' – use _address_matches() (handles road-name false positives)

DATASET_RULES = {
    # community_identity
    "residents-profiles-by-clue-small-area": [
        {"field": "geography", "strategy": "exact"},
    ],
    "multicultural-community-profile-2016": [
        # No direct geographic field per record — geography embedded in 'profile'
        {"field": "profile", "strategy": "exact"},
    ],
    "social-indicators-for-city-of-melbourne-residents-2023": [
        {"field": "respondent_group", "strategy": "contains"},
    ],
    "city-of-melbourne-liveability-and-social-indicators": [
        {"field": "small_area", "strategy": "exact"},
    ],
    "workers-profile-2016": [
        {"field": "profile", "strategy": "exact"},
    ],

    # food_hospitality
    "cafes-and-restaurants-with-seating-capacity": [
        {"field": "clue_small_area", "strategy": "exact"},
        {"field": "building_address", "strategy": "address"},
    ],
    "bars-and-pubs-with-patron-capacity": [
        {"field": "clue_small_area", "strategy": "exact"},
        {"field": "building_address", "strategy": "address"},
    ],

    # local_businesses_shops
    "business-establishments-with-address-and-industry-classification": [
        {"field": "clue_small_area", "strategy": "exact"},
        {"field": "business_address", "strategy": "address"},
    ],
    "coworking-spaces": [
        {"field": "suburb", "strategy": "exact"},
        {"field": "address", "strategy": "address"},
    ],
    "childcare-centres": [
        {"field": "suburb", "strategy": "exact"},
        {"field": "name", "strategy": "contains"},
        {"field": "address", "strategy": "address"},
    ],

    # community_facilities
    "landmarks-and-places-of-interest-including-schools-theatres-health-services-spor": [
        {"field": "clue_small_area", "strategy": "exact"},
        {"field": "feature_name", "strategy": "contains"},
        {"field": "street_address", "strategy": "address"},
    ],
    "free-and-cheap-support-services-with-opening-hours-public-transport-and-parking-": [
        {"field": "suburb", "strategy": "contains"},
        {"field": "name", "strategy": "contains"},
        {"field": "address", "strategy": "address"},
    ],
    "venues-for-event-bookings": [
        {"field": "suburb", "strategy": "exact"},
        {"field": "address", "strategy": "address"},
    ],

    # green_outdoor
    "playgrounds": [
        {"field": "suburb", "strategy": "exact"},
        {"field": "name", "strategy": "contains"},
        {"field": "address", "strategy": "address"},
    ],
    "public-barbecues": [
        {"field": "suburb", "strategy": "exact"},
        {"field": "location_description", "strategy": "contains"},
        {"field": "address", "strategy": "address"},
    ],
    "public-toilets": [
        {"field": "suburb", "strategy": "exact"},
        {"field": "name", "strategy": "contains"},
        {"field": "address", "strategy": "address"},
    ],
    "trees-with-species-and-dimensions-urban-forest": [
        {"field": "precinct", "strategy": "exact"},
    ],

    # arts_culture_events
    "outdoor-artworks": [
        {"field": "clue_small_area", "strategy": "exact"},
        {"field": "location", "strategy": "contains"},
    ],
    "public-artworks-fountains-and-monuments": [
        {"field": "clue_small_area", "strategy": "exact"},
        {"field": "address_point", "strategy": "contains"},
    ],
    "live-music-venues": [
        {"field": "clue_small_area", "strategy": "exact"},
        {"field": "venue_address", "strategy": "address"},
    ],
    "self-guided-walks": [
        {"field": "suburb", "strategy": "exact"},
        {"field": "description", "strategy": "contains"},
    ],
    "event-permits-2014-2018-including-film-shoots-photo-shoots-weddings-christmas-pa": [
        {"field": "suburb", "strategy": "exact"},
        {"field": "title", "strategy": "contains"},
        {"field": "location", "strategy": "contains"},
    ],

    # demographics
    "families-with-children-profile-2016-aged-0-12-years": [
        {"field": "small_area", "strategy": "exact"},
        {"field": "geography", "strategy": "exact"},
    ],
    "tertiary-students-profile-2019": [
        {"field": "small_area", "strategy": "exact"},
        {"field": "geography", "strategy": "exact"},
    ],

    # transport_navigation
    "bus-stops": [
        {"field": "suburb", "strategy": "exact"},
        {"field": "stop_name", "strategy": "contains"},
    ],
    "bicycle-routes-including-informal-on-road-and-off-road-routes": [
        {"field": "suburb", "strategy": "exact"},
    ],
    "pedestrian-counting-system-monthly-counts-per-hour": [
        {"field": "sensor_description", "strategy": "contains"},
    ],
    "footpaths": [
        {"field": "clue_small_area", "strategy": "exact"},
        {"field": "suburb", "strategy": "exact"},
    ],

    # housing_property
    "house-prices-by-small-area-sale-year": [
        {"field": "small_area", "strategy": "exact"},
    ],
    "residential-dwellings": [
        {"field": "clue_small_area", "strategy": "exact"},
        {"field": "building_address", "strategy": "address"},
    ],
}


def record_matches(record: dict, rules: list[dict]) -> bool:
    """Return True if the record matches ANY of the provided rules."""
    for rule in rules:
        field = rule["field"]
        strategy = rule["strategy"]
        value = str(record.get(field, "") or "")

        if strategy == "exact":
            if value.strip().lower() == "kensington":
                return True
        elif strategy == "contains":
            if _matches_kensington(value):
                return True
        elif strategy == "address":
            if _address_matches(value):
                return True
    return False


def extract_from_file(filepath: str, rules: list[dict]) -> list[dict]:
    """Load a JSON file and return only records matching the Kensington rules."""
    with open(filepath, encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        # Some datasets might be wrapped — try common envelope keys
        for key in ("results", "records", "data", "features"):
            if isinstance(data, dict) and key in data:
                data = data[key]
                break

    if not isinstance(data, list):
        return []

    return [r for r in data if record_matches(r, rules)]


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print("=" * 65)
    print("         KENSINGTON SUBURB DATA EXTRACTOR")
    print("=" * 65)
    print(f"Source:  {DATASETS_DIR}/")
    print(f"Output:  {OUTPUT_DIR}/")
    print("=" * 65)

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Discover all JSON files
    all_json_files = sorted(glob.glob(f"{DATASETS_DIR}/**/*.json", recursive=True))
    if not all_json_files:
        print("No JSON files found under ./datasets. Run fetch_datasets.py first.")
        return

    summary_rows = []

    for filepath in all_json_files:
        dataset_id = Path(filepath).stem  # filename without extension
        rules = DATASET_RULES.get(dataset_id)

        if rules is None:
            # Fallback: generic scan of all string fields for "Kensington"
            print(f"\n⚠  No rule defined for '{dataset_id}' — using generic scan")
            rules = [{"field": k, "strategy": "contains"} for k in ["clue_small_area", "suburb", "geography", "precinct"]]

        try:
            matched = extract_from_file(filepath, rules)
        except Exception as exc:
            print(f"\n✗ Error reading {filepath}: {exc}")
            summary_rows.append((dataset_id, 0, "ERROR", filepath))
            continue

        count = len(matched)
        category = Path(filepath).parent.name  # subdirectory name = category

        if count == 0:
            status = "—  (no Kensington records)"
            summary_rows.append((dataset_id, 0, "empty", category))
        else:
            # Write extracted records
            out_path = os.path.join(OUTPUT_DIR, f"{dataset_id}.json")
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(matched, f, indent=2, ensure_ascii=False)
            status = f"✓  {count:,} records → {out_path}"
            summary_rows.append((dataset_id, count, "ok", category))

        print(f"\n[{category}] {dataset_id}")
        print(f"   {status}")

    # ── Summary ────────────────────────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("SUMMARY")
    print("=" * 65)

    total_records = 0
    saved_datasets = 0

    col_w = 55
    print(f"{'Dataset':<{col_w}} {'Records':>8}  Category")
    print("-" * 65)

    for ds_id, count, status, category in sorted(summary_rows, key=lambda x: -x[1]):
        marker = "✓" if status == "ok" else ("!" if status == "ERROR" else " ")
        print(f"{marker} {ds_id:<{col_w - 2}} {count:>8,}  {category}")
        if status == "ok":
            total_records += count
            saved_datasets += 1

    print("-" * 65)
    print(f"  {'TOTAL':<{col_w - 2}} {total_records:>8,}  ({saved_datasets} datasets with data)")
    print("=" * 65)
    print(f"\nKensington data saved to: {os.path.abspath(OUTPUT_DIR)}/")


if __name__ == "__main__":
    main()
