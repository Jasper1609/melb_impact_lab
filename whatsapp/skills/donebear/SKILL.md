---
name: donebear
description: "Operates the Done Bear CLI for command discovery, auth and workspace preflight, task and project workflows, and automation-friendly JSON execution. Validates flags against live help when spec drifts and uses safe patterns for state-changing commands. Use when the user asks to run donebear, manage Done Bear tasks, projects, workspaces, API keys, or Things imports, inspect donebear spec or donebear context, or automate Done Bear from the terminal."
version: 1.0.0
author: mblode
license: MIT
metadata:
  hermes:
    category: productivity
    tags: [donebear, tasks, projects, gtd, cli]
    platforms: [linux]
---

# Done Bear

Operate `donebear` with a try-first, recover-on-failure workflow. Prefer `--json` for agent parsing.

## Reference Files

| File | Read when |
|------|-----------|
| `references/preflight-and-safety.md` | Auth or workspace errors occur, or before destructive writes |
| `references/core-recipes.md` | Running uncommon flows (imports, API keys, workspace management) |
| `references/live-validation.md` | A command fails unexpectedly or `spec` and runtime disagree |

## Quick Reference

Use these directly — no `spec` lookup needed.

| Action | Command |
|--------|---------|
| Add a task | `donebear task add "Title" --when today --json` |
| List tasks | `donebear task list --json` |
| List by view | `donebear task list --view today --json` |
| Today's tasks | `donebear today --json` |
| Complete a task | `donebear task done <id> --json` |
| Edit a task | `donebear task edit <id> --title "New" --deadline 2026-03-20 --json` |
| Search | `donebear search "query" --json` |
| Add project | `donebear project add "Name" --json` |
| Workspace context | `donebear context --json` |

### `task add` flags

`--when <view>` (inbox|anytime|today|upcoming|someday, default: inbox), `--deadline <YYYY-MM-DD>`, `--notes <text>`, `--project <key-or-id>`, `--team <key-or-id>`, `--workspace <id-or-slug>`.

### `task edit` flags

`--title <text>`, `--when <view>`, `--deadline <date>`, `--clear-deadline`, `--notes <text>`, `--clear-notes`, `--project <key-or-id>`, `--clear-project`, `--team <key-or-id>`, `--clear-team`.

### `task list` flags

`--state <open|done|archived|all>` (default: open), `--view <inbox|anytime|today|upcoming|someday>`, `--search <query>`, `--limit <n>` (default: 20).

## Intent Map

| Intent | Commands | Notes |
|--------|----------|-------|
| Discover the CLI | `donebear spec`, `donebear spec <command> [subcommand]` | No auth required |
| Orient the current account | `donebear auth status`, `donebear whoami`, `donebear context` | `context --markdown` is prompt-ready |
| Read and triage work | `task list`, `task show`, `today`, `search`, `history` | Prefer `--json` for parsing |
| Change state | `task add/edit/done`, `project add/edit/done`, `workspace use` | Trust `--json` output for confirmation |
| Risky operations | `auth logout`, `task archive`, `project archive`, `api-key revoke`, `import things` without `--dry-run` | Require explicit user intent |

## Safety Tiers

- `GREEN — execute directly:` `spec`, `auth status`, `whoami`, `workspace list/current`, `context`, `task list/show/read/random`, `today`, `search`, `project list/show`, `label list/show`, `team list/show`, `history`, `api-key list`.
- `YELLOW — announce then execute:` `auth login`, `workspace use/create/join/invite`, `task add/edit/append/prepend/done/reopen/checklist`, `project add/edit/done/unarchive`, `api-key create`, `import things --dry-run`.
- `RED — explicit confirmation required:` `auth logout`, `task archive`, `project archive`, `api-key revoke`, `import things` without `--dry-run`.
- Do not rely on CLI prompts for safety in agent mode. `--json`, `--dry-run`, `--yes`, and non-TTY execution can bypass confirmations.

## Workflow

### Default: Try First, Recover on Failure

1. **Execute the command directly** with `--json`. Use the Quick Reference above for common commands.
2. **Handle errors reactively:**
   - Exit code 4 (AUTH_REQUIRED): Run `donebear auth login`, then retry the original command.
   - "No workspace selected" or workspace errors: Run `donebear workspace list --json`, then `donebear workspace use <slug>`, then retry.
   - Unknown option error: Run `donebear <command> --help` to get the real flags, then retry.
3. **Trust `--json` output.** When `task add --json` returns `{ "created": true, "id": "..." }`, the task exists. Do NOT call `task show` to validate.
4. **Use `donebear spec` only for uncommon commands** or when you need to discover available subcommands.
5. If `donebear` is not on `PATH` but the monorepo is present, use `npm exec --workspace=packages/cli donebear -- <args>` from the repo root.

### When Preflight IS Needed

Load `references/preflight-and-safety.md` in these cases:

- First interaction when you don't know if auth is configured and the command fails with exit 4
- Multi-workspace accounts where no default is set
- Before destructive RED-tier operations
- When running uncommon commands (import, api-key)

## Anti-patterns

- Running `donebear spec` before every command. Use the Quick Reference for common commands.
- Running `auth status` + `whoami` + `workspace current` before every operation. Try the command first.
- Calling `task show` after `task add` to validate. The `--json` output already confirms success.
- Assuming a default workspace exists when multiple workspaces are available.
- Using `--json` on destructive commands without explicit user approval.
- Running `import things` without a dry run first.
- Relying on ambiguous id prefixes when a full id or key is available.
- Launching interactive mode when an explicit command is easier to verify.
