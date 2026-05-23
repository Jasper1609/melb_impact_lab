"""Terminal REPL for the Melb Impact Lab community connector.

Usage:
    python main.py             # interactive chat
    python main.py --verbose   # also print tool calls and tool results

On startup, walks the asker through a short onboarding (postcode, name,
country of origin, languages, occupation, what they're looking for). That
profile is then injected into Claude's system prompt every turn, so the
agent has stable facts about who's asking — no need for the user to repeat
themselves.

Type 'exit', 'quit', or Ctrl-D to leave.
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

# Load .env (find_dotenv walks UP from here so the file can be in BE/ or the
# project root).
try:
    from dotenv import find_dotenv, load_dotenv

    load_dotenv(find_dotenv(usecwd=False))
except ImportError:
    pass

from agent import answer
from db import resolve_postcode

# ---------------------------------------------------------------------------
# language normalisation
# ---------------------------------------------------------------------------

# Map common English language names to ISO-639-1/3 codes. Used at onboarding
# so users can type "English, Farsi" rather than "en, fa". Falls back to
# whatever the user typed (lowercased) if no mapping is found.
_LANG_NAME_TO_CODE: dict[str, str] = {
    "english": "en",
    "mandarin": "zh",
    "chinese": "zh",
    "cantonese": "yue",
    "vietnamese": "vi",
    "arabic": "ar",
    "greek": "el",
    "italian": "it",
    "hindi": "hi",
    "punjabi": "pa",
    "farsi": "fa",
    "persian": "fa",
    "dari": "prs",
    "pashto": "ps",
    "tigrinya": "ti",
    "amharic": "am",
    "somali": "so",
    "spanish": "es",
    "french": "fr",
    "portuguese": "pt",
    "korean": "ko",
    "japanese": "ja",
    "tamil": "ta",
    "turkish": "tr",
    "urdu": "ur",
    "burmese": "my",
    "karen": "kar",
    "swahili": "sw",
    "russian": "ru",
    "polish": "pl",
}


def _normalise_languages(raw: str) -> list[str]:
    """Parse a comma-separated list of language names/codes into ISO codes."""
    tokens = [t.strip().lower() for t in raw.split(",") if t.strip()]
    out: list[str] = []
    for t in tokens:
        out.append(_LANG_NAME_TO_CODE.get(t, t))
    # de-dupe while preserving order
    seen: set[str] = set()
    deduped: list[str] = []
    for code in out:
        if code not in seen:
            seen.add(code)
            deduped.append(code)
    return deduped


# ---------------------------------------------------------------------------
# onboarding
# ---------------------------------------------------------------------------

def _banner() -> None:
    print("=" * 64)
    print(" Melb Impact Lab — community connector (BE)")
    print(" Hybrid filter+semantic search over local profiles & businesses")
    print("=" * 64)


def _ask(prompt: str, *, required: bool = False) -> str:
    """Ask the user a question; allow blank unless required."""
    while True:
        try:
            value = input(prompt).strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye.")
            sys.exit(0)
        if value.lower() in {"exit", "quit"}:
            sys.exit(0)
        if value or not required:
            return value
        print("  (this one is required)\n")


def _onboard() -> dict:
    """Walk the asker through profile capture. Returns an asker_profile dict."""
    print()
    print("Welcome. Tell me a little about yourself — this stays on your machine")
    print("and is used to personalise matches. Press Enter to skip any field.")
    print()

    # postcode is required and must resolve
    while True:
        raw = _ask("Your postcode (required, e.g. 3031 Kensington): ", required=True)
        try:
            lat, lng = resolve_postcode(raw)
            postcode = raw
            break
        except ValueError as exc:
            print(f"  -> {exc}\n")

    name = _ask("Your first name (optional): ")
    country = _ask("Country of origin (optional): ")
    languages_raw = _ask(
        "Languages you speak — comma-separated, e.g. 'English, Farsi, Pashto' (optional): "
    )
    occupation = _ask("Your occupation (optional): ")
    looking_for = _ask("What are you looking for help with right now? (optional, one line): ")

    languages = _normalise_languages(languages_raw) if languages_raw else []
    # Default to English if nothing supplied — the language filter is hard,
    # and an empty list disables it entirely. English is a safe assumption
    # for someone using an English-language CLI.
    if not languages:
        languages = ["en"]

    profile: dict = {
        "postcode": postcode,
        # rough suburb hint from the postcode lookup — purely for display
        "suburb": _SUBURB_HINTS.get(postcode, ""),
    }
    if name:
        profile["name"] = name
    if country:
        profile["country_of_origin"] = country
    profile["languages"] = languages
    if occupation:
        profile["occupation"] = occupation
    if looking_for:
        profile["looking_for"] = looking_for

    print()
    print("Got it. Profile saved for this session:")
    for k, v in profile.items():
        print(f"  {k:>20}: {v}")
    print()
    return profile


# Postcode → human suburb name purely for nicer display in the profile block.
_SUBURB_HINTS = {
    "3031": "Kensington / Flemington",
    "3051": "North Melbourne",
    "3003": "West Melbourne",
    "3032": "Ascot Vale",
    "3000": "Melbourne CBD",
    "3011": "Footscray",
    "3053": "Carlton",
    "3056": "Brunswick",
    "3121": "Richmond",
    "3171": "Springvale",
    "3175": "Dandenong",
}


# ---------------------------------------------------------------------------
# REPL
# ---------------------------------------------------------------------------

def _read_user_input() -> str | None:
    try:
        text = input("\nYou: ").strip()
    except (EOFError, KeyboardInterrupt):
        return None
    if text.lower() in {"exit", "quit"}:
        return None
    if not text:
        return ""
    return text


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print tool calls and tool results as the agent works.",
    )
    args = parser.parse_args()

    # Hard fail early if the keys aren't set.
    has_claude_key = bool(os.environ.get("CLAUDE_API_KEY") or os.environ.get("ANTHROPIC_API_KEY"))
    has_openai_key = bool(os.environ.get("OPENAI_API_KEY"))
    missing = []
    if not has_claude_key:
        missing.append("CLAUDE_API_KEY (or ANTHROPIC_API_KEY)")
    if not has_openai_key:
        missing.append("OPENAI_API_KEY")
    if missing:
        print(f"Missing env vars: {', '.join(missing)}.")
        print("Copy .env.example to .env and fill it in, then re-run.")
        sys.exit(1)

    _banner()
    asker_profile = _onboard()
    print("Ask anything; type 'exit' to quit.")

    history: list = []
    while True:
        user_text = _read_user_input()
        if user_text is None:
            print("\nGoodbye.")
            return
        if user_text == "":
            continue
        try:
            reply = answer(user_text, asker_profile, history, verbose=args.verbose)
        except Exception as exc:
            print(f"\n[error] {type(exc).__name__}: {exc}")
            continue
        print(f"\nAssistant: {reply}")


if __name__ == "__main__":
    main()
