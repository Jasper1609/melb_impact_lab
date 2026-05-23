#!/usr/bin/env python3
"""Build the embedding cache at container startup so the first user message
isn't slowed by a ~30-60 second cold-start.

Run from `entrypoint.sh` after the data has been seeded. Idempotent — if the
cache is already valid (matching _NARRATIVE_VERSION and IDs), this is a no-op.

Usage:
    python warm_embeddings.py
"""

from __future__ import annotations

import os
import sys
import time

from _cli_common import setup_path

setup_path()
from lib.db import _ensure_loaded  # noqa: E402


def main() -> None:
    if not os.environ.get("OPENAI_API_KEY"):
        # Don't crash the container — Hermes might run without it for non-
        # retrieval features. Just skip the warm-up and let the first /chat
        # raise loudly if a retrieval tool is invoked.
        print("[warm] OPENAI_API_KEY not set — skipping embedding warm-up.")
        return

    start = time.time()
    print(f"[warm] building embedding cache from BOT_DATA_DIR="
          f"{os.environ.get('BOT_DATA_DIR', '<default>')}...")
    _ensure_loaded()
    duration = time.time() - start
    print(f"[warm] embedding cache ready ({duration:.1f}s).")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        # Log but don't kill the container — Hermes can still come up and
        # the failure will surface clearly on the first retrieval call.
        print(f"[warm] WARNING: embedding warm-up failed: {type(exc).__name__}: {exc}",
              file=sys.stderr)
        sys.exit(0)
