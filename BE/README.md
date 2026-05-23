# Melb Impact Lab — BE

Terminal-based community-connector for Melbourne. A newcomer asks a question in
natural language; Claude calls hybrid (filter + semantic) retrieval tools over
local seed data and answers.

## Architecture

```
main.py  -- terminal REPL (asks for postcode, loops on questions)
   |
   v
agent.py -- Claude agent loop with tool use
   |
   v
tools.py -- three tools:
             search_community_profiles(...)
             search_local_businesses(...)
             search_community_events(...)
   |
   v
db.py    -- in-memory store loaded from data/*.json
            - on first run, embeds all profiles + businesses + events with OpenAI
            - caches embeddings in data/*.embedded.json
            - hybrid search: structured filter (radius, language, occupation,
              category, date-window, free-only), then cosine-similarity rank

embeddings.py -- OpenAI text-embedding-3-small wrapper
```

No database server required. Everything lives in JSON + in-memory NumPy arrays.

## Setup

```bash
cd BE
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env and paste in ANTHROPIC_API_KEY and OPENAI_API_KEY
```

## Run

```bash
python main.py
```

First run will embed the seed data (one-time, ~10 sec, costs a fraction of a cent).
Subsequent runs reuse the cached `data/profiles.embedded.json` and
`data/businesses.embedded.json`.

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
