---
name: monitoring
description: "Proactive monitoring workflows for email, calendar, tasks, and vault health. Handles daily briefings, meeting reminders, email priority alerts, and scheduled digests. Use when executing a cron job or when the user asks about unread emails, upcoming meetings, or daily status."
version: 1.0.0
author: mblode
license: MIT
metadata:
  hermes:
    category: productivity
    tags: [monitoring, cron, email, calendar, briefing, digest, automation]
    platforms: [linux]
---

# Monitoring

Proactive monitoring and scheduled briefing workflows. This skill is used primarily by cron jobs but can also be triggered manually.

## Reference files

| File | Read when |
|------|-----------|
| [`references/email-monitoring.md`](./references/email-monitoring.md) | Processing email alerts or digests |
| [`references/briefing-templates.md`](./references/briefing-templates.md) | Assembling a morning briefing |

## Silent cron behaviour

High-frequency cron jobs (calendar reminders, email priority alerts) must produce no output at all when there is nothing to report. Do not send "nothing to report" messages for these jobs. The user should only hear from you when there is something worth knowing.

Low-frequency cron jobs (morning briefing, weekly vault health) always produce output, but skip sections with nothing to report rather than padding with filler.

## Morning briefing

Runs daily at 7am. Assembles data from six sources in this order:

1. **Calendar** — today's events via google MCP `listEvents` (sort chronologically)
2. **Tasks** — today's tasks via `donebear today`
3. **Linear** — in-progress and due-soon issues assigned to me via linear MCP
4. **Email** — unread count and notable senders
5. **GitHub** — PR reviews requested, new notifications via github MCP
6. **Vault** — unprocessed inbox items count

Load `references/briefing-templates.md` for the exact format. Keep the briefing to 5-8 sentences. Skip any section with nothing to report.

## Calendar reminders

Runs every 15 minutes on weekdays. Check for events starting in the next 15-20 minutes via the google MCP (`listEvents`). If an event is found, send a one-line reminder with event name, time, and location. If no events, produce no output.

The meeting-briefing skill handles deeper context prep 30-45 minutes before meetings. The calendar reminder continues to fire a short time cue at 15 minutes. These are complementary: the briefing helps you prepare, the reminder tells you to move.

## Email monitoring

Two modes:

- **Priority alert** (every 30 minutes) — check for unread emails from important senders. Alert immediately via WhatsApp. Load `references/email-monitoring.md` for the priority sender rules.
- **Daily digest** (6pm weekdays) — summarise all emails received today grouped by sender. Highlight anything needing a response. Suggest filing actionable items to the vault inbox.

## Routing

| Cron job | Sources | Output |
|----------|---------|--------|
| morning-briefing | Calendar (google MCP), DoneBear, Linear, Email, GitHub, Vault | Always, 5-8 sentences |
| calendar-reminder | Calendar (google MCP) | Only if event in next 15 min |
| email-priority-alert | Email | Only if urgent unread found |
| email-digest | Email | Always on weekdays, skip if empty |
| inbox-processing-reminder | Vault | Only if > 5 raw items |
| task-triage | DoneBear | Always on Mondays |
| weekly-vault-health | Vault | Always on Fridays |
| meeting-briefing | Calendar (google MCP), Vault people/, Linear, GitHub, Email, Vault, DoneBear | Only if meeting in 30-45 min |

## Gotchas

- High-frequency crons (calendar-reminder, email-priority-alert) must be completely silent when nothing to report. Do not send "all clear" or "nothing to report" messages.
- The morning briefing queries six sources. If one source fails (MCP timeout, auth expired), skip that section and deliver the rest. Do not block the entire briefing for one failed source.
- The meeting-briefing cron and calendar-reminder cron are complementary, not redundant. Both should fire for the same meeting at different times.
