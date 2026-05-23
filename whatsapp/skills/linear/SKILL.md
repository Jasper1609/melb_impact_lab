---
name: linear
description: "Reads and manages Linear issues via the linear MCP server. Lists assigned issues, checks project status, creates issues, and adds comments. Use when the user mentions Linear, issues, tickets, sprints, work tracking, or asks about what they're working on at work."
version: 1.0.0
author: mblode
license: MIT
metadata:
  hermes:
    category: productivity
    tags: [linear, issues, work, tracking, sprints, projects]
    platforms: [linux]
---

# Linear

Manages work tracking via the `linear` MCP server.

## Available tools

| Tool | Description |
|------|-------------|
| `get_issue` | Full issue details with optional comments and sub-issues |
| `list_issues` | Filter issues by project, assignee, state, parent |
| `get_status_map` | Map status names to UUIDs for a team |
| `update_issue` | Update any issue field |
| `create_issue` | Create a new issue |
| `create_comment` | Add a comment to an issue |
| `create_document` | Create a document in Linear |

## Common workflows

### What am I working on?

```
list_issues({ assignee: "me", state: "In Progress" })
```

### Morning briefing context

For the morning briefing, check for issues that need attention:

```
list_issues({ assignee: "me", state: "In Progress" })
list_issues({ assignee: "me", state: "Todo" })
```

Report only issues that are in progress or due within 3 days. Don't dump the full backlog.

### Creating an issue from a conversation

When the user asks to "file a ticket" or "create an issue":

1. Ask for the team if not obvious from context
2. Get the status map for that team: `get_status_map({ team: "<team>" })`
3. Create the issue with a short, actionable title

## Routing

| User says | Action |
|-----------|--------|
| "what am I working on" / "my issues" | List in-progress issues |
| "what's blocked" | List issues with blocked state |
| "create a ticket for [thing]" | Create a new issue |
| "update [issue] to [status]" | Update issue state |
| "add a comment on [issue]" | Create a comment |

## Gotchas

- Use `get_status_map` before updating issue state — status UUIDs vary by team.
- The API key scope determines which teams and issues are visible.
- Keep issue titles short and actionable (under 80 chars).
- Confirm before creating issues — the user may just be thinking out loud.
