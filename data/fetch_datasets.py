#!/usr/bin/env python3
"""
Melbourne Open Data Downloader
------------------------------
This script fetches datasets listed in `datalist.json` from the Melbourne
Open Data API (Explore v2.1) and organizes them into category-specific folders.

Usage:
    python fetch_datasets.py
"""

import json
import os
import sys
import time

# --- CONFIGURATION ---
# Your Melbourne Open Data API Key
API_KEY = "c419c66d3b89679335f435699b0701269ba86b00f51806f7f8cf2dd3"

# Path to the datalist JSON configuration file
DATALIST_PATH = "melbourne-open-data-list.json"

# Export format. Choose from: 'json', 'csv', 'geojson', 'parquet', 'jsonl', 'xlsx', etc.
EXPORT_FORMAT = "json"

# Directory where downloaded files will be saved
OUTPUT_DIR = "./datasets"

# Skip downloading a file if it already exists locally. Set to True to re-download everything.
FORCE_REDOWNLOAD = False

# Priority filter. Set to None to download ALL datasets, or specify a list of priorities
# to download (e.g., ["critical", "high"]). Available priorities: "critical", "high", "medium", "low"
PRIORITY_FILTER = None  # Example: ["critical", "high"]

# Base URL for Melbourne Open Data Explore v2.1 API
BASE_URL = "https://data.melbourne.vic.gov.au/api/explore/v2.1"


# --- DOWNLOAD HELPER ---
def download_dataset(dataset_id, format_type, api_key, dest_dir):
    """Downloads a single dataset using the exports endpoint."""
    url = f"{BASE_URL}/catalog/datasets/{dataset_id}/exports/{format_type}"
    params = {
        "apikey": api_key,
        "limit": -1,  # Retrieve all records
    }

    # Construct complete URL with parameters
    import urllib.parse

    query_string = urllib.parse.urlencode(params)
    full_url = f"{url}?{query_string}"

    filename = f"{dataset_id}.{format_type}"
    filepath = os.path.join(dest_dir, filename)

    # Check if file already exists
    if os.path.exists(filepath) and not FORCE_REDOWNLOAD:
        # Check if the file is not empty
        if os.path.getsize(filepath) > 0:
            print(f"   \033[33m⚡ Skipped (already downloaded):\033[0m {filename}")
            return True

    print(f"   🚀 Downloading: \033[1;36m{dataset_id}\033[0m")
    print(f"      Save path: \033[34m{filepath}\033[0m")

    # Try downloading using requests (preferred) or fall back to urllib
    try:
        import requests  # noqa: F401

        success = _download_with_requests(full_url, filepath)
    except ImportError:
        success = _download_with_urllib(full_url, filepath)

    return success


def _download_with_requests(url, filepath):
    """Downloads a file using the requests library with a visual progress bar."""
    import requests

    start_time = time.time()
    try:
        response = requests.get(url, stream=True)

        if response.status_code == 200:
            total_size = int(response.headers.get("content-length", 0))
            block_size = 1024 * 64  # 64 KB chunks

            with open(filepath, "wb") as f:
                downloaded = 0
                for chunk in response.iter_content(chunk_size=block_size):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total_size > 0:
                            percent = (downloaded / total_size) * 100
                            bar = "#" * int(percent / 5) + "-" * (20 - int(percent / 5))
                            sys.stdout.write(
                                f"\r      [{bar}] {percent:.1f}% ({downloaded / (1024 * 1024):.2f} MB)"
                            )
                            sys.stdout.flush()
                        else:
                            sys.stdout.write(
                                f"\r      Downloaded: {downloaded / (1024 * 1024):.2f} MB"
                            )
                            sys.stdout.flush()

            duration = time.time() - start_time
            print(f"\n      \033[1;32m✓ Success!\033[0m Completed in {duration:.2f}s")
            return True
        else:
            print(
                f"      \033[1;31m✗ Failed.\033[0m HTTP Status Code: {response.status_code}"
            )
            try:
                error_msg = response.json()
                print(f"      Error details: {error_msg}")
            except Exception:
                print(f"      Response text: {response.text[:200]}")
            return False

    except Exception as e:
        print(f"      \033[1;31m✗ Connection Error:\033[0m {str(e)}")
        # Clean up partial file if it was created
        if os.path.exists(filepath):
            os.remove(filepath)
        return False


def _download_with_urllib(url, filepath):
    """Downloads a file using the standard urllib library as a fallback."""
    import urllib.error
    import urllib.request

    print("      (Using standard urllib fallback...)")
    start_time = time.time()

    try:
        req = urllib.request.Request(
            url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req) as response:
            total_size = int(response.info().get("Content-Length", 0))
            block_size = 1024 * 64  # 64 KB

            with open(filepath, "wb") as f:
                downloaded = 0
                while True:
                    chunk = response.read(block_size)
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        percent = (downloaded / total_size) * 100
                        bar = "#" * int(percent / 5) + "-" * (20 - int(percent / 5))
                        sys.stdout.write(
                            f"\r      [{bar}] {percent:.1f}% ({downloaded / (1024 * 1024):.2f} MB)"
                        )
                        sys.stdout.flush()
                    else:
                        sys.stdout.write(
                            f"\r      Downloaded: {downloaded / (1024 * 1024):.2f} MB"
                        )
                        sys.stdout.flush()

            duration = time.time() - start_time
            print(f"\n      \033[1;32m✓ Success!\033[0m Completed in {duration:.2f}s")
            return True

    except urllib.error.HTTPError as e:
        print(f"      \033[1;31m✗ HTTP Error {e.code}:\033[0m {e.reason}")
        try:
            error_content = e.read().decode("utf-8")
            print(f"      Error details: {error_content[:500]}")
        except Exception:
            pass
        if os.path.exists(filepath):
            os.remove(filepath)
        return False
    except Exception as e:
        print(f"      \033[1;31m✗ Network Error:\033[0m {str(e)}")
        if os.path.exists(filepath):
            os.remove(filepath)
        return False


def main():
    print("=" * 70)
    print("           MELBOURNE OPEN DATA BULK DOWNLOADER")
    print("=" * 70)

    # 1. Check if API Key is configured
    if not API_KEY or API_KEY == "YOUR_API_KEY_HERE":
        print("\033[1;31mError: Please set your API_KEY in the script.\033[0m")
        sys.exit(1)

    # 2. Check if datalist.json exists
    if not os.path.exists(DATALIST_PATH):
        print(
            f"\033[1;31mError: Configuration file '{DATALIST_PATH}' not found.\033[0m"
        )
        print("Please ensure datalist.json is in the same directory as this script.")
        sys.exit(1)

    # 3. Read datalist.json
    try:
        with open(DATALIST_PATH, encoding="utf-8") as f:
            config = json.load(f)
    except Exception as e:
        print(f"\033[1;31mError parsing '{DATALIST_PATH}':\033[0m {e}")
        sys.exit(1)

    # 4. Extract datasets grouped by category
    categories = config.get("categories", [])
    if not categories:
        print(
            f"\033[1;33mWarning: No categories or datasets found in {DATALIST_PATH}.\033[0m"
        )
        sys.exit(0)

    # Count total datasets that match filter
    filtered_datasets_count = 0
    total_datasets_count = 0

    for category in categories:
        for ds in category.get("datasets", []):
            total_datasets_count += 1
            priority = ds.get("priority", "medium").lower()
            if PRIORITY_FILTER is None or priority in [
                p.lower() for p in PRIORITY_FILTER
            ]:
                filtered_datasets_count += 1

    print(f"Project:         \033[1m{config.get('project', 'Unknown')}\033[0m")
    print(f"Export Format:   \033[1;32m{EXPORT_FORMAT}\033[0m")
    print(f"Total in Config: {total_datasets_count} datasets")
    print(
        f"To Download:     {filtered_datasets_count} datasets"
        + (f" (filtered by priority: {PRIORITY_FILTER})" if PRIORITY_FILTER else "")
    )
    print(f"Output Directory: \033[34m{OUTPUT_DIR}\033[0m")
    print("-" * 70)

    # 5. Fetch datasets category by category
    success_count = 0
    skipped_count = 0
    failed_count = 0
    current_index = 0

    for category in categories:
        category_id = category.get("id", "misc")
        category_label = category.get("label", "Miscellaneous")
        category_emoji = category.get("emoji", "📂")
        datasets = category.get("datasets", [])

        # Filter datasets in this category first
        active_datasets = []
        for ds in datasets:
            priority = ds.get("priority", "medium").lower()
            if PRIORITY_FILTER is None or priority in [
                p.lower() for p in PRIORITY_FILTER
            ]:
                active_datasets.append(ds)

        if not active_datasets:
            continue

        print(
            f"\n{category_emoji} \033[1;35mCategory: {category_label} ({category_id})\033[0m"
        )

        # Create category subdirectory inside OUTPUT_DIR
        category_dir = os.path.join(OUTPUT_DIR, category_id)
        if not os.path.exists(category_dir):
            os.makedirs(category_dir)

        for ds in active_datasets:
            current_index += 1
            ds_id = ds.get("id")
            ds_title = ds.get("title", ds_id)
            ds_priority = ds.get("priority", "medium")

            print(
                f"\n   [{current_index}/{filtered_datasets_count}] \033[1m{ds_title}\033[0m (Priority: {ds_priority})"
            )

            # Check if it already exists to count as skipped or download
            filename = f"{ds_id}.{EXPORT_FORMAT}"
            filepath = os.path.join(category_dir, filename)

            if (
                os.path.exists(filepath)
                and not FORCE_REDOWNLOAD
                and os.path.getsize(filepath) > 0
            ):
                print(
                    f"      \033[33m⚡ Skipped (already downloaded):\033[0m {filename}"
                )
                skipped_count += 1
                continue

            success = download_dataset(ds_id, EXPORT_FORMAT, API_KEY, category_dir)
            if success:
                success_count += 1
            else:
                failed_count += 1

    # 6. Print Summary
    print("\n" + "=" * 70)
    print("🎉 EXECUTION SUMMARY")
    print("=" * 70)
    print(f"Downloaded successfully: \033[1;32m{success_count}\033[0m")
    print(f"Skipped (already exist): \033[1;33m{skipped_count}\033[0m")
    print(f"Failed to download:      \033[1;31m{failed_count}\033[0m")
    print(f"Total processed:         {current_index}")
    print(f"Data saved to:           \033[34m{OUTPUT_DIR}\033[0m")
    print("=" * 70)


if __name__ == "__main__":
    main()
