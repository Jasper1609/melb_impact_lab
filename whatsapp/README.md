# Hermes + Obsidian vault on WhatsApp

A Railway-deployable container that runs [Hermes Agent](https://hermes-agent.nousresearch.com) as a WhatsApp bot with read/write access to an Obsidian vault stored in a GitHub repo. Also monitors email and calendar (Google Workspace) with proactive briefings and reminders.

Built on the [official Hermes Docker image](https://hub.docker.com/r/nousresearch/hermes-agent) with a thin entrypoint wrapper that clones the vault and seeds custom skills before handing off to the upstream bootstrap.

## Architecture

```
WhatsApp (Baileys)  ──▶  Hermes gateway (this container)    ──▶  Google Gemini API
                                                            ──▶  git (Obsidian vault)
                                  │
                                  ├──▶  donebear CLI / MCP          ──▶  Done Bear API
                                  ├──▶  google MCP                   ──▶  Gmail + Google Calendar
                                  ├──▶  agentmail MCP               ──▶  AgentMail (outbound)
                                  ├──▶  cron scheduler              ──▶  WhatsApp (automated messages)
                                  │
                                  └──▶  /vault/AGENTS.md  (vault conventions, read at runtime)
```

The agent reads `/vault/AGENTS.md` on first interaction to learn the vault's folder structure, naming conventions, and workflows. Hermes's memory system caches what it learns across sessions.

WhatsApp uses [Baileys](https://github.com/WhiskeySockets/Baileys) — a WhatsApp Web bridge, **not** the official Meta Cloud API.

## Prerequisites

- A phone number with WhatsApp installed.
- A Google API key (for Gemini).
- A GitHub repo containing your Obsidian vault, plus a fine-scoped PAT with `contents:write` on that repo only.
- A [Railway](https://railway.app) account.
- (Optional) A [Done Bear](https://donebear.com) account and API key for task management.
- (Optional) An [AgentMail](https://agentmail.to) API key for outbound email from a dedicated agent address.

## Deploy

1. Create a new Railway service from this repo. It auto-detects the `Dockerfile` and `railway.toml`.
2. **Attach a volume** in the Railway dashboard, mount path **`/opt/data`** (1 GB is plenty to start).
3. Set the env vars from [`.env.example`](./.env.example) in the Railway service settings. **Set `API_SERVER_KEY`** to a strong random string.
4. Deploy. Watch the logs for `hermes gateway` startup and the `/health` healthcheck passing.
5. **Pair WhatsApp** (see below).

## Pairing WhatsApp (one-time)

1. Open a shell on the running container — `railway ssh` or via the Railway dashboard's "Shell" tab.
2. Inside the container, run `hermes whatsapp`. A QR code prints in the terminal.
3. On your phone: **Settings → Linked Devices → Link a Device**, scan the QR.
4. Once paired, exit the shell. The session is saved to `/opt/data/platforms/whatsapp/session` on the volume and survives restarts.

If WhatsApp ever logs the linked device out, repeat steps 1–3.

## Enabling Google Workspace

The `google` MCP server (`@a-bonus/google-docs-mcp`) provides Gmail and Google Calendar access via the Gmail API and Calendar API with OAuth. Supports full email management including drafts.

1. Create a Google Cloud project and enable Gmail API + Calendar API.
2. Create OAuth 2.0 credentials (Desktop app type).
3. Run locally: `GOOGLE_CLIENT_ID="..." GOOGLE_CLIENT_SECRET="..." npx -y @a-bonus/google-docs-mcp auth`
4. Copy the generated token to `/opt/data/google-mcp-token.json` on the Railway volume.
5. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Railway env vars.

The `google` skill uses this server for email search, sending, drafting, and calendar events. The calendar skill reads events via `listEvents`.

## WhatsApp account safety

Baileys emulates WhatsApp Web — it is not sanctioned by Meta. To reduce the risk of account restriction:

- **Warm up the number first.** Use the phone manually for a week before enabling the bot.
- **Start slow.** Begin with 10–20 automated messages per day. Increase by ~20% every few days.
- **Keep a consistent IP.** Don't deploy across regions.
- **Never run two gateway instances** against the same WhatsApp session simultaneously.
- **Use a number you can afford to lose.** A cheap prepaid eSIM is ideal.

## What the agent can do

- **Search** — content search, filename search, tag search across the vault.
- **Read** — read and summarise notes, follow wikilinks, find backlinks.
- **Write** — create notes, append to notes, manage daily notes. All changes are committed and pushed.
- **Ingest** — process inbox items into compiled knowledge with wikilinks and index updates.
- **Query** — answer questions from the vault's knowledge graph.
- **Lint** — check for orphan pages, dead ends, unresolved links, and index gaps.
- **Tasks** — manage tasks, projects, and checklists via Done Bear (list, add, complete, triage).
- **Watch Email** — monitor Gmail inbox, summarise new messages, alert on priority senders, daily digest.
- **Watch Calendar** — list today's events, send reminders before meetings, morning agenda.

The agent follows the vault's own conventions defined in `AGENTS.md` and gets better at navigating the vault over time through Hermes's self-learning skills system.

## Scheduled automations

The agent runs recurring tasks via Hermes cron jobs, delivering results to WhatsApp:

| Job | Schedule (AEST) | What it does |
|-----|-----------------|--------------|
| Morning briefing | 7:00 AM daily | Calendar, tasks, email highlights, vault inbox count |
| Calendar reminder | Every 15 min (weekdays 8am–8pm) | Reminds you of meetings starting in the next 15 min |
| Email priority alert | Every 30 min (8am–8pm) | Alerts on urgent unread email from important senders |
| Inbox nudge | 12:00 PM Mon/Wed/Fri | Reminds you if unprocessed vault inbox items are piling up |
| Task triage | 9:00 AM Monday | Reviews overdue and unscheduled tasks |
| Email digest | 6:00 PM weekdays | End-of-day email summary grouped by sender |
| Weekly vault health | 6:00 PM Friday | Lint report — orphans, dead links, index gaps |

High-frequency jobs (calendar reminder, email priority) are silent when there is nothing to report.

Default automations are seeded on first boot from `crons.json.seed`. After that, manage cron jobs by messaging the bot — "add a cron job that runs every morning" — or use the `/cron` command.

## Local test

```bash
cp .env.example .env.local
# fill in values
docker build -t hermes-vault .
docker run --rm -p 8642:8642 \
  --env-file .env.local \
  -v hermes-data:/opt/data \
  hermes-vault
```

Message the bot from an allowed number and try:
- *"What's in my vault?"*
- *"Search for notes about <topic>."*
- *"Read my daily note."*
- *"Add to today's daily note: meeting with X about Y."*
- *"Ingest this: <idea or link>."*
- *"What's on my calendar today?"*

## Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Extends official Hermes image with vault-clone logic, SOUL.md, and custom skills. |
| `entrypoint.sh` | Validates env vars, configures git credentials, clones vault, seeds config and skills. |
| `SOUL.md` | Agent identity and behaviour — lean by design, vault conventions come from AGENTS.md at runtime. |
| `config.yaml.example` | Hermes config with tuned memory, session, skill settings, and MCP server definitions. |
| `skills/obsidian-vault/` | Custom skill for vault operations — search, read, write, ingest, query, lint workflows. |
| `skills/donebear/` | Done Bear skill for task management — discovery, auth, task/project workflows, safety tiers. |
| `skills/calendar/` | Calendar skill for Google Calendar — list events, create events, format for WhatsApp, timezone handling. |
| `skills/monitoring/` | Monitoring skill — email triage, briefing assembly, silent cron behaviour, alert rules. |
| `crons.json.seed` | Default scheduled automations, seeded to volume on first boot. |
| `railway.toml` | Railway deploy config (healthcheck, restart policy). |
| `.env.example` | Required and optional env vars. |

## Notes

- The vault is re-cloned into `/vault` on every container start. GitHub is the source of truth.
- The `/opt/data` volume holds Hermes config, agent memory, learned skills, the Honcho user model, and the WhatsApp session — these survive restarts.
- On first boot, `config.yaml` and custom skills are copied to `/opt/data` if not already present. Manual edits on the volume take precedence.
- Cron jobs are seeded from `crons.json.seed` on first boot only. To update crons on an existing deployment, either message the bot or delete `/opt/data/crons.json` and redeploy (this loses custom cron edits).
- The official image drops privileges to UID 10000 after bootstrap. The vault is `chown`ed to this user by the entrypoint.
