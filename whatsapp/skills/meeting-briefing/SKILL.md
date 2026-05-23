---
name: meeting-briefing
description: "Prepares executive-assistant-style meeting briefings by gathering attendee context, related work, email history, and vault notes. Triggered by cron 30-45 min before meetings or on-demand. Use when the user asks to prep for a meeting, brief them on an upcoming meeting, or says 'what do I need to know for my next meeting'."
version: 1.0.0
author: mblode
license: MIT
metadata:
  hermes:
    category: productivity
    tags: [meeting, briefing, calendar, prep, executive-assistant, context]
    platforms: [linux]
---

# Meeting Briefing

Prepares context-rich briefings before meetings by gathering data from calendar, contacts, Linear, GitHub, email, and vault. Creates or updates a meeting note in the vault with full context, then delivers a concise summary via WhatsApp.

## Reference files

| File | Read when |
|------|-----------|
| [`references/briefing-template.md`](./references/briefing-template.md) | Formatting the briefing output |
| [`references/context-gathering.md`](./references/context-gathering.md) | Running the data gathering pipeline |

## When to brief

The cron job checks for meetings starting in 30-45 minutes. Skip meetings that do not warrant a briefing:

- All-day events (no specific start time)
- Events with zero other attendees (solo focus blocks)
- Events with titles matching: Focus, Block, Lunch, Commute, Personal, OOO, Out of Office
- Events already briefed in this session (track by event title + date)

On-demand requests bypass the time window and work for any meeting at any time. For solo events requested on-demand (dentist, gym), return time and location only without the full context pipeline.

## Context gathering

Gather data from seven sources in this order.

1. **Meeting details** — title, time, duration, location, video link, attendees, description from the google MCP (`listEvents`)
2. **Attendees** — names and context from vault people/ notes (see contacts skill)
3. **Related work** — Linear issues in progress, GitHub PRs, Done Bear tasks related to the meeting topic
4. **Communication history** — recent email threads with attendees via `listMessages` (last 14 days)
5. **Vault context** — previous meeting notes, project notes, action items from daily notes
6. **Done Bear** — today's tasks related to the meeting topic
Load `references/context-gathering.md` for the full procedure with exact tool calls.

## Vault meeting note

After gathering context, create or update a meeting note in the vault. This is the persistent prep document with full context — richer than the WhatsApp summary.

- **Path**: `/vault/calendar/meetings/YYYY-MM-DD-meeting-slug.md`
- **Slug**: lowercase, hyphenated version of the meeting title (e.g., `design-review-with-sarah`)
- **If the note already exists**: Update it with fresh context rather than creating a duplicate. Preserve any user-added content (notes, decisions, action items filled in after previous meetings).
- **Git discipline**: Pull before writing, commit and push after. Commit message: `meeting prep | Meeting Title`
- Load `references/briefing-template.md` for the vault note format.

## WhatsApp output rules

The WhatsApp message is a concise summary pointing to the vault note. It is not the full briefing.

- Plain text only. No markdown, headers, emoji, or formatting.
- Write in prose paragraphs, not bullet lists.
- Use 12-hour time. First names only when recognisable.
- Maximum 1000 characters. Shorter is fine. The briefing should fit on one to two phone screens.
- Lead with meeting details (what, when, where, who), then the most important context, then heads-up items.
- Load `references/briefing-template.md` for the exact format and priority tiers.

## Relationship with calendar reminders

The existing calendar-reminder cron fires a one-line time cue 15 minutes before meetings. The meeting briefing fires 30-45 minutes before with full context. They are complementary:

- t-30: Meeting briefing (context to prepare)
- t-15: Calendar reminder (time cue to stop what you are doing)

Both remain active. Do not suppress one for the other.

## Routing

| User says | Action |
|-----------|--------|
| "brief me on my 2pm meeting" / "prep me for the 2pm" | Find event near 2pm today, full briefing |
| "prep me for the standup" / "brief me on standup" | Search today's events by title, full briefing |
| "what do I need to know for my next meeting" | Next upcoming event today, full briefing |
| "brief me on tomorrow's design review" | Search tomorrow's events, full briefing |
| "who's in my 3pm" / "who's in my next meeting" | Attendee-only subset: names and vault context, skip work/email |
| "what happened last time we met with [person]" | Search vault for previous meeting notes, summarise action items |

When the user specifies a time like "my 2pm meeting", search for events starting within 15 minutes of that time. If two meetings match, list both and ask which one.

## Gotchas

- Cache calendar URLs after first discovery in each session. Do not rediscover on every cron invocation.
- Calendar events list attendees as email addresses, display names, or both. Handle all three forms when resolving contacts.
- The gathering pipeline may use 15-20 tool calls for a meeting with several attendees. This is within the agent's turn budget but gather efficiently. Batch lookups where possible and stop once the character budget is full.
