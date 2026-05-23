# Briefing Template

## Contents

- Vault meeting note (frontmatter, note structure, update rules)
- WhatsApp message format (examples, priority tiers)
- Multiple meetings
- Rules

Two outputs per meeting: a vault note (full context, persistent) and a WhatsApp message (concise summary).

## Vault meeting note

Create or update a note at `/vault/calendar/meetings/YYYY-MM-DD-meeting-slug.md`. The vault note is the full prep document — it can be as long as needed. Use standard Obsidian markdown with [[wikilinks]].

### Frontmatter

```yaml
---
created: YYYY-MM-DD
type: meeting
status: upcoming
attendees:
  - "[[person-slug]]"
  - "Attendee Name"
---
```

Use `[[wikilinks]]` for attendees who have a vault people/ note. Use plain strings for attendees without one. Set `status: upcoming` on creation. The user updates to `status: active` or `status: completed` after the meeting.

### Note structure

```markdown
---
created: 2026-05-20
type: meeting
status: upcoming
attendees:
  - "[[sarah-chen]]"
  - "[[james-park]]"
---

# Design Review — 2026-05-20

10:30am — 11:00am (30 min) on Zoom
https://zoom.us/j/123456789

## Attendees

- [[sarah-chen|Sarah Chen]] — Product Designer, working on onboarding flow redesign
- [[james-park|James Park]] — Platform team lead

## Context

Sarah is presenting the updated onboarding mockups. You reviewed her first iteration two weeks ago and flagged the password-reset step as too many clicks ([[2026-05-06-design-review|previous review notes]]).

Your auth middleware rewrite ([[LIN-1234]]) is in progress and blocks part of this flow. The PR is still in draft on GitHub.

Sarah emailed yesterday asking if you could review the Figma before the meeting. You haven't replied yet.

## Related Work

- [[LIN-1234]] Auth middleware rewrite — in progress, blocks onboarding flow
- [[LIN-1289]] Onboarding analytics — due Thursday
- PR #412 mfe-messaging — awaiting your review

## Action Items

- [ ] Reply to Sarah's email before the meeting
- [ ] Review Figma mockups
- [ ] Follow up on password-reset step feedback

## Decisions

(to be filled during or after the meeting)

## Notes

(to be filled during or after the meeting)
```

### Update rules

When updating an existing meeting note:
- Refresh the Context and Related Work sections with current data.
- Preserve user-written content in Decisions, Notes, and any manually added sections.
- Carry forward unchecked action items from previous meetings with the same group. Mark completed items with `- [x]`.
- Do not overwrite attendee wikilinks the user has already corrected.

## WhatsApp message format

The WhatsApp message is a concise summary. Plain text only. No markdown, no headers, no emoji. Write in prose paragraphs. Three parts separated by blank lines:

1. **Opening line** — what the meeting is, when, how long, where, who is attending. Include the video call link on its own line if present.
2. **Context** — 2-4 sentences combining the most relevant gathered context as connected prose. Lead with what matters most: action items from the last meeting, an unresolved email thread, or the agenda.
3. **Heads up** — 1-2 sentences about anything that needs attention before or during the meeting. Only include this if something genuinely warrants it. Omit entirely if nothing does.

Maximum 1000 characters. Shorter is fine. The message should fit on one to two phone screens.

### Example

```
Your design review with Sarah and James is at 10:30am (30 min) on Zoom.
https://zoom.us/j/123456789

Sarah is presenting the updated onboarding mockups. You reviewed her first iteration two weeks ago and flagged the password-reset step as too many clicks. Your auth middleware rewrite in Linear is in progress and blocks part of this flow. Sarah emailed yesterday asking if you could review the Figma before the meeting.

You haven't replied to Sarah's email. The auth middleware PR is still in draft. Full prep notes in the vault.
```

### Another example (less context available)

```
Your standup with the platform team is at 9am (15 min) on Google Meet.
https://meet.google.com/abc-defg-hij

Three Linear issues in progress this sprint: the auth middleware rewrite, the onboarding analytics, and the API rate limiter. The rate limiter PR is ready for review.
```

### Minimal example (solo or low-context meeting)

```
Dentist at 2:30pm (1 hr).
123 Collins St, Melbourne.
```

## Priority tiers

When the WhatsApp message exceeds the character budget, include items in this order and cut from the bottom:

1. Always include: meeting time, duration, attendees (first names), location or video link
2. High priority: action items from the last meeting with this group, unresolved email threads with attendees, the agenda or meeting description
3. Medium priority: related Linear issues in progress, PRs awaiting review, attendee context from vault people/ notes
4. Low priority: tangentially related Done Bear tasks, older vault notes
5. Drop first: attendee contact details (phone, email), general project background, GitHub commit history

When over budget, keep tiers 1-2 in full, summarise tier 3 to one line each, and drop tiers 4-5. The vault note has no character limit — include all gathered context there.

## Multiple meetings

If two meetings fall in the same 30-45 minute window, create separate vault notes for each. Send one WhatsApp message with both briefings separated by a blank line. Brief the earlier meeting first.

## Rules

- Use 12-hour time for all event times.
- Use first names when the person is recognisable from contacts or vault.
- Write WhatsApp context as connected prose, not a list of facts.
- Do not include the meeting description verbatim if it is generic ("Team sync", "Weekly catchup"). Summarise or skip.
- If a meeting has an agenda in the description or a linked doc, mention the key items.
- Do not pad with filler. If context is thin, the briefing can be 2-3 lines. Short is fine.
