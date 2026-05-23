"""Live end-to-end smoke test.

Runs a single query through the full agent loop with verbose=True so you can
see every tool call and result. Exercises:
  - rich asker_profile injection into the system prompt
  - the language-intersection filter
  - all three retrieval tools in one turn
  - query-register-aligned narrative embeddings

Usage:
    python live_test.py
"""

from __future__ import annotations

import sys

from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv(usecwd=False))

from agent import answer  # noqa: E402

# Asker profile — populated as it would be after onboarding via main.py
ASKER_PROFILE = {
    "postcode": "3031",
    "suburb": "Kensington / Flemington",
    "name": "Reza",
    "country_of_origin": "Afghanistan",
    "languages": ["en", "fa", "ps"],  # English, Farsi, Pashto
    "occupation": "mechanical engineer (currently driving rideshare)",
    "looking_for": (
        "Help getting back into mechanical engineering — Engineers Australia "
        "CDR pathway, mentorship from someone who has been through it, and "
        "any free workshops or community events that would help."
    ),
}

QUERY = (
    "What can you find for me — people, places, things happening soon? I "
    "just moved here a few weeks ago and I don't know where to start."
)

if __name__ == "__main__":
    print("=" * 72)
    print("ASKER PROFILE:")
    for k, v in ASKER_PROFILE.items():
        print(f"  {k:>20}: {v}")
    print("-" * 72)
    print(f"QUERY: {QUERY}")
    print("=" * 72)

    history: list = []
    try:
        reply = answer(QUERY, ASKER_PROFILE, history, verbose=True)
    except Exception as exc:
        print(f"\n[ERROR] {type(exc).__name__}: {exc}")
        sys.exit(1)

    print("\n" + "=" * 72)
    print("FINAL REPLY:")
    print("=" * 72)
    print(reply)
    print("=" * 72)
    print(f"\nHistory turns: {len(history)}")
