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
                "CLAUDE_API_KEY (or ANTHROPIC_API_KEY) is not set. Copy .env.example to .env and fill it in."
            )
        _client = Anthropic(api_key=api_key)
    return _client


def _format_asker_profile(p: dict[str, Any]) -> str:
    """Render the asker's profile as a clearly-delimited block for the system prompt.

    If the profile is empty/unknown (e.g. a WhatsApp message from a phone
    number we don't recognise), renders an explicit 'no profile' block so the
    LLM knows it needs to onboard the user before running retrieval tools.
    """
    lines = ["=== ASKER PROFILE ==="]
    if not p:
        lines.append("(No profile on file for this user yet.)")
        lines.append("=== END ASKER PROFILE ===")
        return "\n".join(lines)

    if p.get("postcode"):
        lines.append(f"Postcode: {p['postcode']} ({p.get('suburb', 'Melbourne')})")
    else:
        lines.append("Postcode: UNKNOWN (must be gathered before tool use)")
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
    has_postcode = bool(asker_profile.get("postcode"))
    name_hint = (
        f"Address the asker as {asker_profile['name']} if it feels natural." if asker_profile.get("name") else ""
    )

    if not has_postcode:
        # Anonymous / pre-onboarding mode. Tools need a postcode so refuse to
        # call them and gather info conversationally instead.
        return (
            "You are a warm, practical assistant helping newcomers and "
            "residents connect with each other, with services, and with "
            "what's happening in Melbourne, Australia.\n\n"
            f"{profile_block}\n\n"
            "This user has no profile yet. Ask ONE thing: what suburb or "
            "area of Melbourne they are in. One sentence only. Do not ask "
            "multiple questions. Do not list what you can help with. Do not "
            "use bullet points. Once they reply with a location, you can "
            "start helping. Always respond in English."
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
        "Tool selection (we have five tools):\n"
        "  • search_community_profiles — PEOPLE (mentors, peers, someone who "
        "speaks the asker's language, someone who has navigated the same "
        "journey).\n"
        "  • search_local_businesses — every kind of registered business near "
        "the asker, sourced from the City of Melbourne CLUE register. Use "
        "for: 'where can I get my hair cut', 'is there an accountant near me', "
        "'find me a local plumber', or any specific industry the user names. "
        "NOT language-tagged — don't pass asker_languages here.\n"
        "  • search_cafes_restaurants — cafes/restaurants/takeaway with seat "
        "counts. Use when the user wants somewhere to eat, meet, or host a "
        "group. If they mention group size, pass min_seats.\n"
        "  • search_landmarks_places — the curated CoM landmarks list: places "
        "of worship, schools, health services, community halls, sports "
        "facilities. Use for religious practice, schooling, healthcare, "
        "community infrastructure questions.\n"
        "  • search_community_events — things HAPPENING SOON (workshops, info "
        "sessions, cultural festivals, language circles, repair cafes, "
        "markets) or 'what's on'.\n\n"
        "  • If the user's need plausibly involves multiple categories, CALL "
        "MULTIPLE TOOLS in the same turn. Stitching them together is the most "
        "valuable thing you can do.\n\n"
        "Retry behaviour: if a tool returns count=0, retry once with a larger "
        "radius (5 → 15 → 30 km for profiles/businesses; 10 → 25 → 50 km for "
        "events) before telling the user nothing was found.\n\n"
        "When presenting results, always mention: name/title, suburb, "
        "distance, and one concrete detail that explains *why* it's a good "
        "fit. For events, also surface the date in human form (e.g. 'next "
        "Wednesday evening') and whether registration is required. Suggest a "
        "low-friction next step (e.g. 'I can draft an intro message', 'their "
        "phone number is X', 'here's the registration link'). Be "
        "conversational, not list-formatted, unless the user asks for a list.\n\n"
        "Response rules (MANDATORY):\n"
        "- 2-3 sentences max. This is WhatsApp, not email.\n"
        "- No bullet lists unless the user explicitly asks for a list.\n"
        "- No multiple-choice menus. Just answer or ask ONE follow-up.\n"
        "- Plain text only. No markdown, no headers, no emoji.\n"
        "- Always respond in English.\n"
        "- One concrete recommendation beats five options.\n"
        "- The user's profile already has their location — never ask for it."
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
            max_tokens=300,
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
            return f"[agent] Stopped unexpectedly: {response.stop_reason}. Try rephrasing or extending max_tokens."

        # Execute every tool_use block in the assistant turn, then loop.
        tool_results: list[dict[str, Any]] = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            if verbose:
                print(f"[tool] {block.name} <- {json.dumps(block.input, ensure_ascii=False)}")
            result = dispatch(block.name, block.input)
            if verbose:
                print(f"[tool] {block.name} -> count={result.get('count', '-')} err={result.get('error', '-')}")
            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result, ensure_ascii=False, default=str),
                }
            )

        history.append({"role": "user", "content": tool_results})

    return "[agent] Hit the tool-iteration cap without producing an answer."
