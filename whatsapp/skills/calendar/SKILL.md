---
name: calendar
description: "Reads and manages calendar events from Google Calendar via the google MCP server. Lists today's events, checks for upcoming meetings, creates events, and formats event details for WhatsApp. Use when the user mentions calendar, events, meetings, schedule, agenda, or when a cron job needs calendar data."
version: 4.0.0
author: mblode
license: MIT
metadata:
  hermes:
    category: productivity
    tags: [calendar, google, events, meetings, schedule]
    platforms: [linux]
---

# Calendar

Reads and manages calendar events from Google Calendar using the `google` MCP server (OAuth via `@a-bonus/google-docs-mcp`).

## Setup

The MCP server is configured in `config.yaml` as `google`. It provides these calendar tools:

| Tool | Purpose |
|------|---------|
| `listEvents` | List upcoming events in a time range |
| `createEvent` | Create a new event |
| `deleteEvent` | Delete a calendar event |
| `updateEvent` | Update an existing event |
| `quickAddEvent` | Create an event from natural language |

## Listing today's events

```
listEvents({
  start: "YYYY-MM-DDT00:00:00",
  end: "YYYY-MM-DDT23:59:59"
})
```

Timezone is Australia/Melbourne (AEST UTC+10 / AEDT UTC+11). Use the current offset based on whether daylight saving is active.

## Checking for upcoming meetings

For pre-meeting reminders, query for events starting in the next 15-20 minutes:

```
listEvents({
  start: "<now ISO>",
  end: "<now + 20 minutes ISO>"
})
```

## Creating and deleting events

Google Calendar is read/write. Use `createEvent`, `deleteEvent`, and `updateEvent` when the user asks to manage their calendar.

## Formatting for WhatsApp

Events should be presented as plain text, one event per line, sorted by time:

```
9:00am — Standup (Zoom)
10:30am — Design review with Sarah
2:00pm — Sprint planning (Room 4B)
```

Use 12-hour time. Include location if present. No markdown formatting.

## Routing

| User says | Action |
|-----------|--------|
| "what's on my calendar" / "today's events" | List today's events |
| "any meetings coming up" | Check next 2 hours |
| "am I free at 3pm" | Check for conflicts at that time |
| "what's on tomorrow" | List tomorrow's events |
| "this week's calendar" | List events for the current week |
| "schedule a meeting with X at 3pm" | Create a new event |

## Gotchas

- All-day events have no specific time — list them first as "All day — Event name".
- Recurring events may appear as individual instances. Don't deduplicate them.
- The `listEvents` default range is now to +7 days if no range is specified.
