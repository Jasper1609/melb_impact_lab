# Preflight And Safety

## Runner Check

- Preferred runner: `donebear --help`
- Repo-local fallback: `npm exec --workspace=packages/cli donebear -- --help`
- Use the repo-local runner from the Donebear monorepo root, not from this skills repo.

## Auth Preflight

1. Run `donebear auth status --json`.
2. If it returns `ok: false` or `authenticated: false`, either:
   - run `donebear auth login`
   - or export `DONEBEAR_TOKEN` / pass `--token`
3. Run `donebear whoami --json` to confirm Supabase accepts the token.
4. If commands still fail, continue with the failure patterns below.

### Auth Facts

- `auth login` supports `--port`, `--timeout`, and `--no-open`.
- Default callback URL is `http://127.0.0.1:8787/auth/callback`.
- `--no-open` prints the URL but still expects the same machine to receive the callback.
- Token precedence is `--token` -> `DONEBEAR_TOKEN` -> stored session.
- `auth logout` only clears the stored session. It does not disable `--token` or `DONEBEAR_TOKEN`.

### Common Auth Failures

- `auth status --json` can fail with a refresh-token error when `auth.json` is stale.
  Fix: `donebear auth logout`, then `donebear auth login` or set `DONEBEAR_TOKEN`.
- `auth status` is only a local resolution check.
  Fix: use `donebear whoami --json` to prove the token works.
- Mutations that need a user id can fail even with a bearer token.
  Fix: use a token with JWT user claims or log in interactively.

## API Key Auth

API keys are an alternative to interactive login for headless and agent use.

```bash
donebear api-key create "hermes" --json
donebear api-key create "ci" --permissions read-only --expires 90d --json
donebear api-key create "scoped" --workspaces personal --json
donebear api-key list --json
donebear api-key revoke <id>
```

- Set `DONEBEAR_TOKEN=<key>` in the environment or pass `--token <key>`.
- Token precedence: `--token` > `DONEBEAR_TOKEN` > stored session.
- `--permissions` accepts `full-access` (default) or `read-only`.
- `--workspaces` accepts comma-separated workspace slugs to restrict the key's scope.
- `--expires` accepts a duration like `30d`, `90d`, `1y`.
- `donebear whoami --json` validates that the key works and shows the associated user.

## Workspace Preflight

- Run `donebear workspace current --json` or `donebear workspace list --json`.
- If only one workspace exists, the CLI can auto-select and persist it.
- If multiple workspaces exist and none is selected, `context` and many writes fail.
- Use one of:
  - `donebear workspace use <id-or-slug>`
  - `donebear workspace=<slug> task list --json`

## Environment And Local State

- API URL precedence is `--api-url` -> `DONEBEAR_API_URL` -> `https://api.donebear.com`.
- Env files load once from the current working directory in this order:
  - `.env.local`
  - `.env`
  - `apps/manage-frontend/.env.local`
  - `apps/manage-api/.env`
- Existing shell env wins over `.env` files.
- `DONEBEAR_CONFIG_DIR` only affects the current run if it is already exported in the shell. Setting it only in `.env` is too late for path resolution.
- Local state lives in the config dir as unencrypted JSON:
  - `auth.json`
  - `context.json`

## Safety Rules

- Treat `task archive`, `project archive`, `auth logout`, `api-key revoke`, and non-dry-run imports as explicit-confirmation operations.
- `--json`, `--dry-run`, `--yes`, and non-TTY execution can auto-skip built-in confirmations.
- For list-like commands, prefer the command-local `--limit` over the global `--limit`. Most JSON outputs are wrapped objects, so the global limiter may do nothing.
