# Context Gathering Procedure

## Contents

- Step 0: Pull vault
- Step 1: Get meeting details
- Step 2: Resolve attendees
- Step 3: Related work
- Step 4: Communication history
- Step 5: Vault context
- Step 6: Write vault meeting note
- Step 7: Send WhatsApp briefing
- Efficiency guidelines

Step-by-step procedure for assembling meeting context and writing it to the vault. Execute in order. Stop gathering once the briefing clearly has enough context. A shorter, focused briefing is better than an exhaustive one.

## Step 0: Pull vault

Sync the vault before reading or writing:

```bash
git -C /vault pull --ff-only
```

## Step 1: Get meeting details

Query Google Calendar for events in the target window.

For cron: events starting in 30-45 minutes from now.
For on-demand: events matching the user's specified time or title.

```
listEvents({
  start: "<window start ISO>",
  end: "<window end ISO>"
})
```

From each matching event, extract:
- Title
- Start time, end time (calculate duration)
- Location or video call link (check both location field and description for Zoom/Meet/Teams URLs)
- Attendee list (email addresses and/or display names)
- Description or notes
- Organiser

Apply qualifying criteria from the skill overview. Skip all-day events, solo blocks, and events with excluded titles.

## Step 2: Resolve attendees

For each attendee (excluding yourself):

### Vault people/ search

```bash
rg -l "attendee-name\|attendee-email" /vault/people/ --glob '*.md'
```

If a note exists, read it for context: role, relationship, what you are working on together, notes about previous interactions. Keep to the most relevant 1-2 sentences.

If the calendar event already includes attendee names and sufficient context, skip the vault lookup to save tool calls.

## Step 3: Related work

Based on the meeting title, description, and attendee identities, check for related work items.

### Linear issues

```
list_issues({ assignee: "me", state: "In Progress" })
```

Filter for issues whose title, project, or description overlaps with the meeting topic or involves the same team as the attendees. Also check:

```
list_issues({ assignee: "me", state: "Todo" })
```

Only include issues clearly related to the meeting. Do not dump the full backlog.

### GitHub PRs

If the meeting relates to a specific repo or project:

```
list_pull_requests({ owner: "<org>", repo: "<repo>", state: "open" })
```

Highlight PRs that are awaiting your review or that you authored and are relevant to the discussion.

### Done Bear tasks

```bash
donebear today --json
```

Check if any of today's tasks relate to the meeting topic or attendees.

## Step 4: Communication history

Search for recent email threads with meeting attendees via Gmail.

```
listMessages({
  query: "from:<attendee-email>",
  maxResults: 10
})
```

Run for each attendee (up to 3 attendees to stay within tool call budget). Note unresolved threads where you owe a reply or they asked a question.

Summarise the 1-2 most relevant threads. Do not list every email.

## Step 5: Vault context

### Previous meeting notes

Search for notes about previous meetings with the same group or on the same topic:

```bash
rg -l "meeting-title\|attendee-first-name" /vault --glob '*.md' | head -10
```

If meeting notes exist, scan for action items (lines containing "- [ ]" or "action:" or "TODO"). Surface any outstanding items.

### Project notes

If the meeting relates to a known project, search for the project note:

```bash
rg -l "project-name" /vault --glob '*.md' | head -5
```

Read the project note for current status if it exists.

### Recent daily notes

Check the last 5 daily notes for mentions of the meeting topic or attendees:

```bash
rg -l "topic\|attendee-name" /vault/calendar/daily/ --glob '*.md' | tail -5
```

## Step 6: Write vault meeting note

Create or update the meeting note using the gathered context. See `references/briefing-template.md` for the vault note format.

### Check for existing note

```bash
ls /vault/calendar/meetings/YYYY-MM-DD-meeting-slug.md 2>/dev/null
```

If the note exists, read it first. Preserve user-written content in Decisions, Notes, and any manually added sections. Update Context, Related Work, and Action Items with fresh data.

### Create the meetings directory if needed

```bash
mkdir -p /vault/calendar/meetings
```

### Write the note

Use the `cat >` heredoc pattern from the obsidian-vault skill to create the note. Include all gathered context — the vault note has no character limit.

Link attendees with `[[wikilinks]]` to their vault people/ notes where they exist. Link Linear issues, GitHub PRs, and previous meeting notes with `[[wikilinks]]`.

### Commit and push

```bash
git -C /vault add /vault/calendar/meetings/YYYY-MM-DD-meeting-slug.md
git -C /vault commit -m "meeting prep | Meeting Title"
git -C /vault push
```

## Step 7: Send WhatsApp briefing

Compose the WhatsApp message using the gathered context. See `references/briefing-template.md` for the WhatsApp format. The WhatsApp message is a concise summary — the vault note has the full details.

If the vault note was created successfully, end the WhatsApp message with "Full prep notes in the vault." so the user knows to check Obsidian for the complete briefing.

## Efficiency guidelines

- Skip vault people/ lookup if the calendar event already provides attendee names and context.
- Limit email searches to the top 3 attendees by relevance (skip attendees from large distribution lists).
- If multiple meetings qualify in one invocation, cap at 2 briefings. Prioritise by start time.
- Stop gathering early once the briefing has enough context. Short and focused beats exhaustive.
- For cron invocations, aim to complete the full pipeline in under 30 tool calls. For on-demand, the agent has more conversational turns available.
