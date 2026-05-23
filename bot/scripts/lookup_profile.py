#!/usr/bin/env python3
"""Look up a community profile by phone number (or WhatsApp JID).

Usage:
    python lookup_profile.py 61400000000
    python lookup_profile.py 61403333333@s.whatsapp.net
    python lookup_profile.py +61403333333
    python lookup_profile.py 0403333333

Output: JSON object (the profile) if found, or `null` if not.
Always exits 0 — absence is not an error.
"""

from __future__ import annotations

import argparse

from _cli_common import setup_path, run

setup_path()
from lib.db import lookup_profile_by_phone  # noqa: E402


def main():
    p = argparse.ArgumentParser()
    p.add_argument("phone", help="Phone in any reasonable format (JID, +61, 04xx, raw).")
    args = p.parse_args()

    # Returns dict or None — both serialise cleanly.
    return lookup_profile_by_phone(args.phone)


if __name__ == "__main__":
    run(main)
