# Melb Impact Lab — BE

Community-connector backend for Melbourne. A newcomer asks a question in
natural language; Claude calls hybrid (filter + semantic) retrieval tools
over real City of Melbourne open data and a curated profile database.

Has two entry points:

- **`main.py`** — terminal REPL with rich onboarding (postcode, name,
  languages, country, occupation, looking_for).
- **`server.py`** — FastAPI HTTP service exposing `/chat` and
  `/profile/by-phone/{phone}`. Used by the WhatsApp bot (`bot/`).

## Architecture

```
   main.py  (CLI)              server.py  (HTTP)              ← entry points
        \                         /
         \                       /
          v                     v
   agent.py -- Claude agent loop with tool use
        |
        v
   tools.py -- FIVE tools:
                search_community_profiles(...)
                search_local_businesses(...)        ← CoM CLUE register, ~1,800
                search_cafes_restaurants(...)       ← CoM CLUE + seat counts
                search_landmarks_places(...)        ← CoM places of interest
                search_community_events(...)        ← curated local events
        |
        v
   db.py    -- in-memory store from data/*.json
                - lookup_profile_by_phone(phone): WhatsApp JID → profile
                - hybrid search: structured filter (radius, language
                  INTERSECTION, occupation, category, theme, seats, date)
                  + cosine-similarity rank over query-register narratives
                - embedding cache auto-invalidates on _NARRATIVE_VERSION bump

embeddings.py -- OpenAI text-embedding-3-small wrapper
```

No database server required. Everything lives in JSON + in-memory NumPy arrays.

No external database required. Everything lives in JSON + in-memory NumPy
arrays.

## Setup

```bash
cd BE
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env and paste in CLAUDE_API_KEY (or ANTHROPIC_API_KEY) and OPENAI_API_KEY
```

## Data preparation (one-time)

The real CoM datasets are downloaded by the script at `../data/fetch_datasets.py`.
After they're on disk, run:

```bash
python prepare_data.py
```

This filters the raw 413k-record CoM business register down to ~1,800
Kensington-cluster records, dedupes cafes, and projects into `BE/data/*.json`.
Re-run any time the raw CoM data refreshes.

## Run — CLI

```bash
python main.py
```

First run embeds the seed data (~30 sec for 2,200 records, ~$0.005). Cached
to `data/*.embedded.json`. Re-embed automatically if `_NARRATIVE_VERSION` in
`db.py` is bumped.

## Run — HTTP server (for the WhatsApp bot)

```bash
uvicorn server:app --host 0.0.0.0 --port 8765 --reload
```

Endpoints:
- `GET  /health` — liveness
- `GET  /profile/by-phone/{phone}` — accepts JIDs / +61 / 04xx formats
- `POST /chat` — body `{message, phone, asker_profile_override?}`, returns
  `{reply, asker_known, asker_name, asker_phone_normalised}`

See `../bot/skills/tapestry-retrieval/SKILL.md` for how the WhatsApp bot
calls this service.

You'll be prompted once for your postcode (try `3011` for Footscray or `3171`
for Springvale to match the seed data), then you can ask questions like:

- *"I'm a nurse from India looking for someone to help me with AHPRA"* → likely calls **profiles** + **events**
- *"Are there any community spaces near me where I could meet people?"* → calls **businesses**
- *"I need an engineer mentor who speaks Farsi"* → calls **profiles** with language filter
- *"What free events are on this week for newcomers?"* → calls **events** with `free_only=true` and tight window
- *"I'm new in Footscray — give me everything"* → likely calls all THREE tools

Type `exit` to quit.

## Models

| Purpose | Model | Notes |
|---|---|---|
| Reasoning + tool use | `claude-sonnet-4-6` | Overridable via `ANTHROPIC_MODEL` |
| Embeddings | `text-embedding-3-small` (1536 dim) | Overridable via `OPENAI_EMBEDDING_MODEL`. Use `text-embedding-ada-002` if you want the legacy ada model. |

The Anthropic API key is read from `CLAUDE_API_KEY` first, then `ANTHROPIC_API_KEY` (the SDK default) as a fallback — so either works.

## Schema notes

**Profiles** (`data/profiles.json`): id, name, age, postcode, suburb, lat, lng,
country_of_origin, languages, occupation, background, interests, offering,
opt_in_matching.

**Businesses** (`data/businesses.json`): Google Places-style fields:
place_id, name, formatted_address, geometry.location.{lat,lng}, types, rating,
user_ratings_total, business_status, opening_hours, formatted_phone_number,
website, price_level, editorial_summary.overview.

**Events** (`data/events.json`): id, title, description, start_datetime
(ISO 8601 with +10:00 offset), end_datetime, venue.{name,address,suburb,lat,lng},
organizer, categories[], languages[], is_free, cost_aud, registration_url,
registration_required, welcomes_newcomers, audience_notes, recurring, source.
Past events are filtered out at search time — the `start_datetime` field
must be in the future for an event to be returned.

## Cold-start caveat

The seed data is 5 profiles + 5 businesses + 8 events, all hand-crafted. For a
real demo, scale to ~30–50 profiles seeded from Census language/occupation
distributions for your target suburbs (Footscray, Springvale, Dandenong) and
~20–30 events pulled from real council/library/community feeds.
