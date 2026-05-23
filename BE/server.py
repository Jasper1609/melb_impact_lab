"""FastAPI HTTP service wrapping BE — the bridge for the WhatsApp bot.

Endpoints
=========

POST /chat
    Run one turn of the BE agent loop. The caller passes a free-text message
    plus the user's phone number (or WhatsApp JID). If the phone matches a
    profile in our database, the full profile is injected as ASKER PROFILE in
    the system prompt; if not, the agent treats the caller as a blank user
    and onboards them conversationally.

GET /profile/by-phone/{phone}
    Returns the matching profile (200) or 404. Phone normalisation accepts
    raw JIDs (`61400123456@s.whatsapp.net`), international (`+61400123456`),
    and Australian local (`0400123456`).

GET /health
    Liveness probe.

Run with:
    cd BE
    uvicorn server:app --host 0.0.0.0 --port 8000 --reload
"""

from __future__ import annotations

import os
from pathlib import Path

# Load .env from BE/ or repo root before importing anything that needs keys.
try:
    from dotenv import find_dotenv, load_dotenv

    load_dotenv(find_dotenv(usecwd=False))
except ImportError:  # pragma: no cover
    pass

from typing import Any, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from agent import answer
from db import lookup_profile_by_phone, normalise_phone


app = FastAPI(
    title="Melb Impact Lab — BE Retrieval Service",
    description=(
        "HTTP bridge for the Tapestry WhatsApp bot. Wraps the BE agent loop "
        "(profile-by-phone lookup + hybrid retrieval over Kensington-area "
        "profiles, businesses, cafes, landmarks, events)."
    ),
    version="0.3.0",
)


# ---------------------------------------------------------------------------
# request / response models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str = Field(..., description="The user's natural-language message.")
    phone: Optional[str] = Field(
        None,
        description=(
            "The user's phone number, in any reasonable format. WhatsApp JIDs "
            "(`61400123456@s.whatsapp.net`), international (`+61400123456`), "
            "and Australian local (`0400123456`) are all accepted. If a "
            "matching profile exists, it's used; otherwise the user is "
            "treated as anonymous and onboarded conversationally."
        ),
    )
    asker_profile_override: Optional[dict] = Field(
        None,
        description=(
            "Optional explicit profile to use, bypassing the phone lookup. "
            "Useful for testing or for clients that have richer context."
        ),
    )


class ChatResponse(BaseModel):
    reply: str
    asker_known: bool
    asker_name: Optional[str] = None
    asker_phone_normalised: Optional[str] = None


class ProfileResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    postcode: str
    suburb: str
    country_of_origin: Optional[str] = None
    languages: list
    occupation: Optional[str] = None
    background: Optional[str] = None
    interests: Optional[str] = None
    offering: Optional[str] = None


# ---------------------------------------------------------------------------
# endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/profile/by-phone/{phone}", response_model=ProfileResponse)
def get_profile_by_phone(phone: str) -> dict[str, Any]:
    profile = lookup_profile_by_phone(phone)
    if profile is None:
        raise HTTPException(
            status_code=404,
            detail=f"No profile found for phone {phone!r}",
        )
    return profile


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    # Resolve the asker profile.
    profile: dict[str, Any] | None
    if req.asker_profile_override is not None:
        profile = req.asker_profile_override
    elif req.phone:
        profile = lookup_profile_by_phone(req.phone)
    else:
        profile = None

    asker_profile = profile or {}

    # Stateless across HTTP calls — Hermes (or other caller) owns conversation
    # history, BE handles a single retrieval-grounded turn.
    history: list = []
    reply_text = answer(req.message, asker_profile, history, verbose=False)

    return ChatResponse(
        reply=reply_text,
        asker_known=profile is not None,
        asker_name=(profile.get("name") if profile else None),
        asker_phone_normalised=(normalise_phone(req.phone) if req.phone else None),
    )
