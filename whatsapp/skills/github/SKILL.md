---
name: github
description: "Interacts with GitHub via the github MCP server. Searches repositories, lists issues and PRs, checks notifications, and manages files. Use when the user mentions GitHub, PRs, pull requests, repos, issues, code review, or notifications."
version: 1.0.0
author: mblode
license: MIT
metadata:
  hermes:
    category: development
    tags: [github, pull-requests, issues, code-review, notifications]
    platforms: [linux]
---

# GitHub

Interacts with GitHub via the `github` MCP server. Uses the same `GITHUB_TOKEN` as vault git operations.

## Available tools

| Tool | Description |
|------|-------------|
| `search_repositories` | Search GitHub repos |
| `get_file_contents` | Read file or directory contents |
| `create_or_update_file` | Create or update a file |
| `push_files` | Push multiple files in one commit |
| `create_issue` | Create a new issue |
| `create_pull_request` | Create a PR |
| `search_issues` | Search issues and PRs |
| `list_issues` | List issues for a repo |
| `get_issue` | Get issue details |
| `list_commits` | List recent commits |
| `get_pull_request` | Get PR details |
| `list_pull_requests` | List PRs for a repo |

## Common workflows

### Morning briefing context

For the morning briefing, check for items needing attention:

1. Search for PRs where review is requested from me
2. Check for recent notifications or @-mentions

Report only actionable items. Skip bot notifications and CI status updates.

### PR review status

When the user asks about PRs:

```
list_pull_requests({ owner: "<org>", repo: "<repo>", state: "open" })
```

### Checking a specific PR

```
get_pull_request({ owner: "<org>", repo: "<repo>", pullNumber: <number> })
```

## Routing

| User says | Action |
|-----------|--------|
| "any PRs waiting on me" | Search for review-requested PRs |
| "what's open on [repo]" | List open PRs for that repo |
| "check PR #123" | Get PR details |
| "create an issue on [repo]" | Create a new issue |
| "what changed recently in [repo]" | List recent commits |

## Gotchas

- The token scope determines which repos and orgs are accessible.
- Don't fetch full file contents for large files — use targeted path queries.
- Confirm before creating issues or PRs — these are visible to the whole team.
- The vault itself is a GitHub repo. Don't confuse vault git operations (direct git CLI) with the GitHub MCP tools (API-based).
