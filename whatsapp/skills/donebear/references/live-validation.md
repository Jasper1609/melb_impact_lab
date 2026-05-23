# Live Validation

Use this whenever discovery docs, help text, and runtime behavior do not line up.

## Validation Order

1. Run `donebear <command> --help` to confirm the current Commander signature.
2. Run `donebear spec <command> [subcommand]` to inspect the intended JSON output shape.
3. If the command writes state, try the smallest safe variant first:
   - a read-only companion command
   - a narrower id-scoped command
   - `--dry-run` when supported
4. Trust the runtime result over docs when they conflict.
5. After a write, rerun a read command to confirm the new state.

## Known Drifts

No known drifts as of 2026-03-13. If a command fails unexpectedly, run `donebear <command> --help` to confirm the current signature, then update this section.

## Output Validation Tips

- `spec` always emits JSON-style structured output even if `--format yaml` is requested.
- Most list commands return wrapper objects like `{ tasks: [...] }`, `{ projects: [...] }`, or `{ labels: [...] }`.
- The global `--limit` only slices top-level arrays after `--jq`. For task, search, today, and history, the reliable limiter is the command-local `-n/--limit`.
- `--json` forces JSON output even when `--format` is also passed.

## Failure Patterns

- `auth status --json` can fail with exit code `4` on a stale stored refresh token instead of returning `authenticated: false`.
  Fix: `donebear auth logout`, then re-run `auth login` or set `DONEBEAR_TOKEN`.
- `whoami` can fail even when `auth status` says authenticated, because `auth status` is local resolution while `whoami` hits Supabase.
  Fix: treat `whoami` as the server-side validation step.
- `context`, `task`, `project`, and import flows can fail when no workspace is selected and multiple workspaces exist.
  Fix: use `workspace current`, `workspace list`, or prefix the command with `workspace=<slug>`.
- Mutations that need a user id can fail with `Could not determine user id from auth token`.
  Fix: use an interactive session or a JWT-bearing token, not an opaque bearer string.
