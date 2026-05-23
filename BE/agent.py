"""Claude agent loop with tool use.

One entry point: `answer(user_message, asker_postcode, history)`.

The loop:
  1. Send the user message (and any prior history) to Claude with the tool
     schemas attached.
  2. If Claude wants to call tools, run them, append the results, and loop.
  3. When Claude returns end_turn with text, return that text.

History is a list of role/content dicts and is mutated in place so the caller
can keep state across turns of a CLI session.
"""

from __future__ import annotations

import json
import os
from typing import Any

from anthropic import Anthropic

from tools import TOOL_SCHEMAS, dispatch

_DEFAULT_MODEL = "claude-sonnet-4-6"
_MAX_TOOL_ITERATIONS = 6  # safety cap

_client: Anthropic | None = None


def _get_client() -> Anthropic:
    global _client
    if _client is None:
        # Prefer CLAUDE_API_KEY (user convention) but fall back to the SDK's
        # default ANTHROPIC_API_KEY so this works either way.
        api_key = os.environ.get("CLAUDE_API_KEY") or os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError(
                "CLAUDE_API_KEY (or ANTHROPIC_API_KEY) is not set. "
                "Copy .env.example to .env and fill it in."
            )
        _client = Anthropic(api_key=api_key)
    return _client


def _format_asker_profile(p: dict[str, Any]) -> str:
    """Render the asker's profile as a clearly-delimited block for the system prompt.

    Only includes fields that were actually filled in (the user can skip
    most fields at signup). Always shows postcode (required).
    """
    lines = ["=== ASKER PROFILE ==="]
    lines.append(f"Postcode: {p['postcode']} ({p.get('suburb', 'Melbourne')})")
    if p.get("name"):
        lines.append(f"Name: {p['name']}")
    if p.get("country_of_origin"):
        lines.append(f"Country of origin: {p['country_of_origin']}")
    if p.get("languages"):
        lines.append(f"Languages spoken: {', '.join(p['languages'])}")
    if p.get("occupation"):
        lines.append(f"Occupation: {p['occupation']}")
    if p.get("looking_for"):
        lines.append(f"Currently looking for: {p['looking_for']}")
    lines.append("=== END ASKER PROFILE ===")
    return "\n".join(lines)


def _system_prompt(asker_profile: dict[str, Any]) -> str:
    profile_block = _format_asker_profile(asker_profile)
    name_hint = (
        f"Address the asker as {asker_profile['name']} if it feels natural."
        if asker_profile.get("name")
        else ""
    )
    return (
        "You are a warm, practical assistant helping newcomers and residents "
        "connect with each other, with services, and with what's happening in "
        "Melbourne, Australia. Your job is to surface people, places, and "
        "events that already exist nearby — and to make warm, contextual "
        "introductions, not bureaucratic lookups.\n\n"
        f"{profile_block}\n\n"
        "Use the ASKER PROFILE block as ground truth across every turn. "
        f"ALWAYS pass `user_postcode={asker_profile['postcode']}` to tools. "
        f"Whenever calling search_community_profiles or "
        f"search_community_events, ALWAYS pass `asker_languages` set to the "
        f"full Languages list above — it gates whether profiles/events that "
        f"share at least one language with the asker are returned. "
        f"{name_hint}\n\n"
        "Tool selection:\n"
        "  • Use search_community_profiles when the user wants a PERSON "
        "(mentor, peer, someone who speaks their language, someone who has "
        "navigated the same journey).\n"
        "  • Use search_local_businesses when the user wants a PLACE "
        "(library, community centre, settlement service, tool library, "
        "support service). Businesses are NOT language-tagged in our data, "
        "so do not pass asker_languages to this tool.\n"
        "  • Use search_community_events when the user wants something "
        "HAPPENING SOON (workshops, info sessions, cultural festivals, "
        "language circles, repair cafes, markets) or asks 'what's on'.\n"
        "  • If the user's need plausibly involves two or three of these, "
        "CALL MULTIPLE TOOLS in the same turn. Stitching them together is "
        "the most valuable thing you can do.\n\n"
        "Retry behaviour: if a tool returns count=0, retry once with a larger "
        "radius (5 → 15 → 30 km for profiles/businesses; 10 → 25 → 50 km for "
        "events) before telling the user nothing was found.\n\n"
        "When presenting results, always mention: name/title, suburb, "
        "distance, and one concrete detail that explains *why* it's a good "
        "fit. For events, also surface the date in human form (e.g. 'next "
        "Wednesday evening') and whether registration is required. Suggest a "
        "low-friction next step (e.g. 'I can draft an intro message', 'their "
        "phone number is X', 'here's the registration link'). Be "
        "conversational, not list-formatted, unless the user asks for a list."
    )


def answer(
    user_message: str,
    asker_profile: dict[str, Any],
    history: list[dict[str, Any]],
    *,
    model: str | None = None,
    verbose: bool = False,
) -> str:
    """Run one turn of the agent loop and return Claude's final text.

    `asker_profile` is the structured profile captured at onboarding (postcode,
    name, languages, country, occupation, looking_for). It is rendered into
    the system prompt every turn so Claude always has stable facts about who
    is asking. `history` is mutated in place across turns.
    """
    model = model or os.environ.get("ANTHROPIC_MODEL", _DEFAULT_MODEL)
    client = _get_client()

    history.append({"role": "user", "content": user_message})

    for iteration in range(_MAX_TOOL_ITERATIONS):
        response = client.messages.create(
            model=model,
            max_tokens=1024,
            system=_system_prompt(asker_profile),
            tools=TOOL_SCHEMAS,
            messages=history,
        )

        # Record the assistant's full content (text blocks + tool_use blocks).
        history.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            # Find the last text block and return its text.
            for block in response.content:
                if block.type == "text":
                    return block.text
            return ""  # no text? shouldn't happen, but be safe

        if response.stop_reason != "tool_use":
            # Something unexpected (max_tokens, stop_sequence, etc.).
            return (
                f"[agent] Stopped unexpectedly: {response.stop_reason}. "
                f"Try rephrasing or extending max_tokens."
            )

        # Execute every tool_use block in the assistant turn, then loop.
        tool_results: list[dict[str, Any]] = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            if verbose:
                print(
                    f"[tool] {block.name} <- {json.dumps(block.input, ensure_ascii=False)}"
                )
            result = dispatch(block.name, block.input)
            if verbose:
                print(
                    f"[tool] {block.name} -> count={result.get('count', '-')} "
                    f"err={result.get('error', '-')}"
                )
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": json.dumps(result, ensure_ascii=False, default=str),
            })

        history.append({"role": "user", "content": tool_results})

    return "[agent] Hit the tool-iteration cap without producing an answer."
