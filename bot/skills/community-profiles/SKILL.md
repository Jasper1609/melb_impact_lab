---
name: community-profiles
description: "Manages user profiles for community members. Tracks name, language, neighbourhood, interests, skills, and needs. Use when the user shares personal info, asks to update their profile, or when you need to personalise recommendations."
version: 1.0.0
author: melb-impact-lab
license: MIT
metadata:
  hermes:
    category: community
    tags: [profiles, users, matching, personalisation]
    platforms: [linux]
---

# Community Profiles

Manages user profiles that are built up naturally through conversation. Profiles allow the concierge to personalise recommendations and remember context across sessions.

## Storage

Profiles are stored at `/opt/data/profiles.json` as a JSON object keyed by WhatsApp JID (e.g. `"61400000000@s.whatsapp.net"`).

## Profile fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | User's preferred name |
| `language` | string | Preferred language (ISO code or full name) |
| `neighbourhood` | string | Suburb or area they live in |
| `interests` | string[] | Things they enjoy: sports, cooking, art, music, etc. |
| `skills` | string[] | Skills they can offer to the community |
| `needs` | string[] | What they are looking for help with |
| `country_of_origin` | string | Where they moved from (only if voluntarily shared) |
| `first_seen` | string | ISO date of first interaction |
| `last_seen` | string | ISO date of most recent interaction |
| `message_count` | number | Total messages exchanged |

## Reading profiles

```bash
# Check if a profile exists
cat /opt/data/profiles.json | jq 'has("61400000000@s.whatsapp.net")'

# Read a specific profile
cat /opt/data/profiles.json | jq '."61400000000@s.whatsapp.net"'

# Read a specific field
cat /opt/data/profiles.json | jq '."61400000000@s.whatsapp.net".neighbourhood'

# List all profiles (names only)
cat /opt/data/profiles.json | jq 'to_entries[] | {jid: .key, name: .value.name}'

# Count total profiles
cat /opt/data/profiles.json | jq 'length'
```

## Writing profiles

Use a temporary file and atomic move to avoid corruption:

```bash
# Create a new profile
cat /opt/data/profiles.json | jq '."61400000000@s.whatsapp.net" = {
  "name": "Ahmed",
  "language": "arabic",
  "neighbourhood": "footscray",
  "interests": [],
  "skills": [],
  "needs": ["english-classes"],
  "country_of_origin": null,
  "first_seen": "2026-05-23",
  "last_seen": "2026-05-23",
  "message_count": 1
}' > /tmp/profiles_tmp.json && mv /tmp/profiles_tmp.json /opt/data/profiles.json
```

```bash
# Update a single field
cat /opt/data/profiles.json | jq '."61400000000@s.whatsapp.net".neighbourhood = "brunswick"' > /tmp/profiles_tmp.json && mv /tmp/profiles_tmp.json /opt/data/profiles.json
```

```bash
# Append to an array field
cat /opt/data/profiles.json | jq '."61400000000@s.whatsapp.net".interests += ["cooking"]' > /tmp/profiles_tmp.json && mv /tmp/profiles_tmp.json /opt/data/profiles.json
```

```bash
# Update last_seen and message_count
cat /opt/data/profiles.json | jq '."61400000000@s.whatsapp.net".last_seen = "2026-05-23" | ."61400000000@s.whatsapp.net".message_count += 1' > /tmp/profiles_tmp.json && mv /tmp/profiles_tmp.json /opt/data/profiles.json
```

## Building profiles naturally

Profiles are built up through conversation, not through a form. Extract information as the user mentions it:

- "I'm Ahmed" -> set `name` to "Ahmed"
- "I live in Footscray" -> set `neighbourhood` to "footscray"
- "I moved from Syria" -> set `country_of_origin` to "Syria"
- "I love cooking and football" -> add to `interests`
- "I'm a graphic designer" -> add to `skills`
- "I need English classes" -> add to `needs`

Don't ask for information you don't need. Only ask for profile details when they would help you give better recommendations.

## Routing

| User says | Action |
|-----------|--------|
| "What do you know about me" / "my profile" | Read and summarise their profile |
| "My name is [name]" | Update `name` field |
| "I moved to [area]" / "I live in [area]" | Update `neighbourhood` field |
| "Update my profile" | Ask what they'd like to change |
| "Forget me" / "delete my data" | Remove their profile entry (confirm first) |
| "I speak [language]" | Update `language` field |
| "I'm interested in [topic]" | Append to `interests` array |

## Gotchas

- **Never share one user's profile data with another user.** Profiles are private to each individual.
- **Profiles are supplementary to the Hermes memory system.** Hermes has its own memory and context. Profiles store structured data that Hermes memory does not cover (like arrays of interests or neighbourhood slugs for filtering).
- **Don't over-ask.** If the user just wants a quick answer, don't push them to complete their profile.
- **Handle missing profiles gracefully.** If `/opt/data/profiles.json` doesn't exist or is empty, create it as `{}` before writing.
- **Country of origin is sensitive.** Only record it if the user volunteers it. Never ask directly.
- **Atomic writes are important.** Always write to a temp file and `mv` to avoid partial writes corrupting the JSON file.
