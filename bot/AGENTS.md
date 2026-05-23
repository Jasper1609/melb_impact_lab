# Tapestry

AI-powered WhatsApp companion that helps newcomers and migrants settle into Melbourne. Built on the Hermes Agent platform.

## Commands

```bash
# Build and run
docker build -t tapestry .
docker run --rm -p 8642:8642 --env-file .env -v tapestry-data:/opt/data tapestry
```

- First run: scan QR code from terminal output with WhatsApp > Settings > Linked Devices
- Session persists on the Docker volume, no re-scan needed after restart

## Architecture

```
WhatsApp (Baileys)  ──▶  Hermes Gateway  ──▶  Claude API (Anthropic)
                              │
                              ├──  faster-whisper (voice transcription)
                              ├──  skills/concierge (community knowledge)
                              ├──  skills/community-profiles (user profiles)
                              └──  /opt/data/data/ (community.json, neighbourhoods.json)
```

## Project structure

| File / Directory | Purpose |
|---|---|
| `Dockerfile` | Extends official Hermes image, copies skills and seeds community data |
| `entrypoint.sh` | Validates env vars, seeds community JSON data to volume on first boot |
| `SOUL.md` | Agent identity and behaviour for the Tapestry persona |
| `config.yaml.example` | Hermes config: Claude Sonnet model, WhatsApp settings, session/memory tuning |
| `.env.example` | Required and optional environment variables |
| `skills/concierge/SKILL.md` | Core skill: onboarding flow, community resource lookup, neighbourhood matching |
| `skills/concierge/references/` | Reference docs loaded by the skill (resource lists, conversation templates) |
| `skills/community-profiles/SKILL.md` | User profile skill: tracks language, neighbourhood, interests, onboarding progress |
| `src/data/community.json` | Community resources database: groups, services, events, contacts (50+ entries) |
| `src/data/neighbourhoods.json` | Melbourne neighbourhood profiles: demographics, transport, services, character (10 areas) |

## Conventions

- **Hermes Agent platform** -- not custom application code. The bot is a configured Hermes instance with custom skills and data.
- **Skills define agent behaviour** via `SKILL.md` files with YAML frontmatter. Skills are the primary way to extend the agent.
- **Community data is JSON files** seeded from `src/data/` to `/opt/data/data/` on first boot. Editable on the volume after that.
- **User profiles** are stored as JSON on the Docker volume by the community-profiles skill.
- **Voice notes are auto-transcribed** by faster-whisper running locally inside the container. Configured in `config.yaml.example` under `stt:` with provider `local` and model `base` (~150MB, auto-downloaded). Supports 99 languages. No external API key needed for transcription.
- **LLM**: Claude Sonnet via Anthropic API (`ANTHROPIC_API_KEY`).
- **WhatsApp**: plain text responses only. No markdown rendering. Limited emoji. Keep messages short for mobile.

## Adding community data

Community resources and neighbourhood profiles are JSON files seeded to the Docker volume on first boot.

To update after first boot:

1. Edit `src/data/community.json` or `src/data/neighbourhoods.json` in this repo.
2. Either rebuild and redeploy (the entrypoint re-seeds if the files are missing), or:
3. Copy the updated file directly to the running volume at `/opt/data/data/`.

The skill reads these files at runtime. Changes take effect on the next conversation.

### community.json structure

Each entry should include: name, category (e.g. "language-support", "employment", "housing", "social", "health", "legal", "education"), description, location/neighbourhood, contact info, languages supported, and any eligibility criteria.

### neighbourhoods.json structure

Each entry should include: name, description, key demographics, public transport access, nearby services, community groups, and general character/vibe.

## Gotchas

- **Never run two instances** against the same WhatsApp session. Baileys will conflict and both will disconnect.
- **WhatsApp account can be restricted** by Meta for automated messaging. Warm up the number manually for a week before enabling the bot. Start with low message volume.
- **Use a dedicated/prepaid number**, not a personal one. A cheap prepaid SIM or eSIM is ideal.
- **`auth_state` on the volume** contains WhatsApp encryption keys. Back up the volume after first pairing. If lost, you must re-pair.
- **If the Hermes base image updates** break things, pin a specific tag in the Dockerfile instead of `:latest`.
- **Community data is seeded once.** The entrypoint only copies `community.json` and `neighbourhoods.json` to the volume if they don't already exist. To force a re-seed, delete the files from `/opt/data/data/` and restart.
- **Voice transcription** happens automatically for audio messages via local faster-whisper. The transcribed text is passed to the agent as if the user typed it. No language detection config needed. Model auto-downloads on first voice message (~150MB for `base`). Upgrade to `small` or `medium` in `config.yaml` if transcription quality is poor.
- **Whisper hallucination filtering** is built into Hermes. Silent or near-silent voice notes produce phrases like "Thank you" or "Subscribe" — these are caught and filtered automatically.
