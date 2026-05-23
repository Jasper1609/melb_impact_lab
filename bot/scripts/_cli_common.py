"""Shared bits for every CLI script in bot/scripts/.

- sys.path setup so `from lib.X import ...` works when invoked directly
- A `parse_languages()` helper that turns "en,fa,ps" into ["en","fa","ps"]
- A `run()` wrapper that JSON-dumps the result to stdout and writes
  error JSON to stderr with non-zero exit
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Callable

# Best-effort: load nearest .env on import. Inside the Hermes container,
# env vars are already set by entrypoint.sh so this is a no-op. Locally,
# this lets you run scripts directly from the repo root.
try:
    from dotenv import find_dotenv, load_dotenv

    load_dotenv(find_dotenv(usecwd=False))
except ImportError:
    pass


def setup_path() -> None:
    """Allow `from lib.X import ...` when this script is invoked as a path."""
    here = Path(__file__).resolve().parent
    if str(here) not in sys.path:
        sys.path.insert(0, str(here))


def parse_languages(raw: str | None) -> list[str] | None:
    if not raw:
        return None
    parts = [p.strip().lower() for p in raw.split(",") if p.strip()]
    return parts or None


def parse_csv(raw: str | None) -> list[str] | None:
    if not raw:
        return None
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    return parts or None


def run(fn: Callable[[], Any]) -> None:
    """Execute `fn` and print JSON. On error, JSON-dump to stderr and exit 1.

    Hermes-side bash should: capture stdout for the result, check exit code.
    """
    try:
        result = fn()
    except Exception as exc:
        json.dump(
            {"error": f"{type(exc).__name__}: {exc}"},
            sys.stderr,
            ensure_ascii=False,
            default=str,
        )
        sys.stderr.write("\n")
        sys.exit(1)
    json.dump(result, sys.stdout, ensure_ascii=False, default=str)
    sys.stdout.write("\n")
