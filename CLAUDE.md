# Tapestry — Claude Impact Lab Melbourne (Team 12)

## Project Structure

```
fe/          React Native + Expo mobile app (TypeScript)
BE/          Python FastAPI backend — agent loop + hybrid retrieval
bot/         WhatsApp bot via Hermes Agent platform (Docker)
data/        Raw Melbourne City Council datasets + fetch scripts
```

## Commands

```bash
# Frontend
cd fe && npm install && npx expo start

# Backend CLI
cd BE && pip install -r requirements.txt && python main.py --verbose

# Backend HTTP server
cd BE && uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# WhatsApp bot
cd bot && docker build -t tapestry . && docker run --rm -p 8642:8642 --env-file .env -v tapestry-data:/opt/data tapestry

# Lint
cd fe && npx ultracite
cd BE && ruff check . && ruff format --check .
```

## Environment Variables

Both `BE/` and `bot/` need `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` set in a `.env` file. Copy `.env.example` in the relevant directory.

## Conventions

- Python code lives in `BE/` and `bot/scripts/lib/`. TypeScript in `fe/`.
- No external database. All data is JSON files + NumPy arrays in memory.
- Embedded JSON caches (`*.embedded.json`) are gitignored and auto-regenerated on first run. Bump `_NARRATIVE_VERSION` in `db.py` to force a rebuild.
- `BE/data/` and `bot/data/` are independent copies of the same seed data. Keep them in sync manually when editing profiles or events.
- Frontend is a prototype with hardcoded data in `fe/constants/plan-data.ts`. No backend integration yet.

## Testing Postcodes

Use these postcodes when testing the backend CLI or API:

| Postcode | Suburb |
|----------|--------|
| 3031 | Kensington / Flemington |
| 3051 | North Melbourne |
| 3003 | West Melbourne |
| 3032 | Ascot Vale |
| 3000 | Melbourne CBD |

## Per-Component Docs

- [`BE/README.md`](BE/README.md) — backend architecture, API schema, hybrid retrieval design
- [`fe/README.md`](fe/README.md) — mobile app user flow, design system, dummy data inventory
- [`bot/AGENTS.md`](bot/AGENTS.md) — WhatsApp bot setup, Hermes platform guide, gotchas
- [`data/README.md`](data/README.md) — City of Melbourne open data catalogue
