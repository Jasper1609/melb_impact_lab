---
name: tapestry-retrieval
description: "Primary skill — delegates EVERY user message to the Tapestry BE retrieval service over HTTP. The BE service handles profile-by-phone lookup, hybrid retrieval (filter + semantic) across community profiles, businesses, cafes/restaurants, landmarks, and events, and returns a single warm reply. Use this skill on every incoming user message instead of cat/jq on local JSON files."
version: 1.0.0
author: melb-impact-lab
license: MIT
metadata:
  hermes:
    category: community
    tags: [melbourne, community, migrants, retrieval, http, backend]
    platforms: [linux]
---

# Tapestry Retrieval

This skill replaces the legacy `concierge` and `community-profiles` skills.
Instead of reading local JSON files, it delegates each user message to the
**Tapestry BE** HTTP service, which:

1. Looks up the user's profile by their WhatsApp phone number. If the number
   matches a profile in the BE database, that profile is injected as ASKER
   PROFILE into BE's system prompt. If not, BE treats the user as anonymous
   and onboards them conversationally.
2. Runs a multi-tool retrieval (people / businesses / cafes / landmarks /
   events) over real City of Melbourne open data, all hybrid-filtered
   (radius + language intersection + opt-in) and semantically ranked.
3. Returns a single, ready-to-send WhatsApp reply.

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `BE_URL` | `http://host.docker.internal:8765` | Base URL of the Tapestry BE HTTP service. Override per deployment. |

When running inside Docker on macOS, `host.docker.internal` resolves to the
host machine. On Linux, set `BE_URL=http://172.17.0.1:8765` or use a Docker
network alias.

## Routing — call BE on every message

When you receive a user message, the user's WhatsApp JID is available as
`$WHATSAPP_JID` (e.g. `61400000000@s.whatsapp.net`). On every turn:

```bash
# 1) Resolve the BE URL (host.docker.internal is the default for macOS Docker)
BE_URL="${BE_URL:-http://host.docker.internal:8765}"

# 2) POST the user's message + phone to BE /chat
# Use jq to safely build the JSON payload (avoids quoting bugs on user input)
PAYLOAD=$(jq -nc \
  --arg message "$USER_MESSAGE" \
  --arg phone "$WHATSAPP_JID" \
  '{message: $message, phone: $phone}')

RESPONSE=$(curl -sS --max-time 60 -X POST "$BE_URL/chat" \
  -H 'Content-Type: application/json' \
  -d "$PAYLOAD")

# 3) Pull out the reply text and the "asker_known" flag
REPLY=$(echo "$RESPONSE" | jq -r '.reply')
KNOWN=$(echo "$RESPONSE" | jq -r '.asker_known')
NAME=$(echo "$RESPONSE" | jq -r '.asker_name // empty')

# Return $REPLY verbatim as the WhatsApp message.
```

The BE service is the authority on retrieval quality and profile awareness.
Do not rephrase, summarise, or add to BE's reply — return it as-is. BE has
already followed the SOUL voice rules.

## What BE returns

The `/chat` response shape:

```json
{
  "reply": "string — the assistant message to send back over WhatsApp",
  "asker_known": true,
  "asker_name": "Faisal Ahmadi",
  "asker_phone_normalised": "61403333333"
}
```

`asker_known: false` means the user's phone wasn't found in the BE profile
store, and BE returned an onboarding-style reply asking for postcode/area.
There's nothing extra for you to do — BE handles that conversation flow.

## Direct profile lookup (rare)

Most of the time, you don't need to look up a profile yourself — BE does it
internally during `/chat`. If the user explicitly asks to see *their own*
profile, you can call:

```bash
curl -sS "$BE_URL/profile/by-phone/$WHATSAPP_JID"
```

A `200` returns the profile JSON; a `404` means no profile yet.

## Fallback if BE is unavailable

If `curl` returns a non-zero exit code or `$REPLY` is empty:

1. Apologise briefly: "I'm having trouble reaching my knowledge service right
   now — give me a moment and try again."
2. Do NOT fall back to fabricating community recommendations from memory. BE
   exists exactly because Claude alone is unreliable on local Melbourne data.

## Gotchas

- **Never include the user's message in a `-d` literal without `jq -nc`.**
  Curly braces, quotes, and newlines in messages will break the JSON
  payload otherwise.
- **BE is stateless across HTTP calls.** Conversation history lives in
  Hermes's own memory. If a user references something from earlier in the
  conversation that BE doesn't see, weave the prior context into the
  `message` field you POST — e.g. send "Earlier you said you live in
  Kensington. Now: what's a good cafe?" rather than just "what's a good
  cafe?".
- **`--max-time 60` is intentional.** First call after BE startup may take
  ~30s because the embedding cache is being built. Subsequent calls are
  sub-second.
- **WhatsApp formatting.** BE already returns WhatsApp-friendly prose
  (paragraph breaks, minimal markdown). Do not re-wrap.
