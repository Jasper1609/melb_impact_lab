# Tapestry

AI-powered community connector helping newcomers and migrants settle into Melbourne. Built by Team 12 at the Claude Impact Lab Melbourne.

Tapestry surfaces people, places, and events nearby — matching them to a newcomer's language, location, occupation, and needs using hybrid semantic search over City of Melbourne open data.

## Architecture

```
fe/   React Native + Expo mobile app (prototype, hardcoded data)
       |
BE/   Python FastAPI backend — Claude agent loop + hybrid retrieval
       |
bot/  WhatsApp companion — Hermes Agent platform + Docker
       |
data/ Melbourne City Council open datasets + transformation scripts
```

The backend powers both the WhatsApp bot (live) and the mobile app (prototype). It runs a Claude Sonnet agent loop with five retrieval tools over community profiles, businesses, cafes, landmarks, and events — all stored as JSON with NumPy-backed semantic search. No database required.

## Quickstart

### Backend (Python)

```bash
cd BE
cp .env.example .env   # add ANTHROPIC_API_KEY and OPENAI_API_KEY
pip install -r requirements.txt
python main.py          # interactive CLI
# or
uvicorn server:app --host 0.0.0.0 --port 8000 --reload  # HTTP API
```

See [`BE/README.md`](BE/README.md) for architecture details, API schema, and cold-start notes.

### Mobile App (Expo)

```bash
cd fe
npm install
npx expo start          # opens Expo dev tools
```

The app is a frontend prototype with hardcoded data — no backend integration yet. See [`fe/README.md`](fe/README.md) for the user flow and design system.

### WhatsApp Bot (Docker)

```bash
cd bot
cp .env.example .env    # add ANTHROPIC_API_KEY and OPENAI_API_KEY
cp config.yaml.example config.yaml
docker build -t tapestry .
docker run --rm -p 8642:8642 --env-file .env -v tapestry-data:/opt/data tapestry
```

First run: scan the QR code from terminal output with WhatsApp. See [`bot/README.md`](bot/README.md) for setup details and gotchas.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native, Expo SDK 54, TypeScript 5.9 |
| Backend | Python, FastAPI, NumPy |
| LLM | Claude Sonnet (Anthropic API) |
| Embeddings | OpenAI text-embedding-3-small |
| Bot | Hermes Agent platform, faster-whisper (local STT) |
| Data | City of Melbourne CLUE register, landmarks, events |

## Data Pipeline

```
data/fetch_datasets.py        Download 30 CoM open datasets
        |
BE/prepare_data.py            Filter to Kensington cluster, clean, deduplicate
        |
BE/data/*.json                Seed data (profiles, businesses, cafes, landmarks, events)
        |
(first run)                   Auto-embed with OpenAI, cache as *.embedded.json
```

See [`data/README.md`](data/README.md) for the full dataset catalogue.

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Yes | Claude API for the agent loop |
| `OPENAI_API_KEY` | Yes | Text embeddings for semantic search |
| `ANTHROPIC_MODEL` | No | Override model (default: `claude-sonnet-4-6`) |

## Team

Team 12 — Claude Impact Lab Melbourne, 2025.
