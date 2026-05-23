#!/usr/bin/env bash
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-/opt/data}"
VAULT_DIR="${VAULT_DIR:-/vault}"
DATA_LAKE_DIR="${DATA_LAKE_DIR:-/data-lake}"

: "${VAULT_REPO_URL:?ERROR: VAULT_REPO_URL is not set}"
: "${GITHUB_TOKEN:?ERROR: GITHUB_TOKEN is not set}"
if [ -z "${ANTHROPIC_API_KEY:-}" ] && [ -z "${GOOGLE_API_KEY:-}" ]; then
  echo "ERROR: Set at least one of ANTHROPIC_API_KEY or GOOGLE_API_KEY" >&2
  exit 1
fi

if [[ "$VAULT_REPO_URL" != https://* ]]; then
  echo "ERROR: VAULT_REPO_URL must start with https://" >&2
  exit 1
fi

mkdir -p "$HERMES_HOME"

API_PORT="${PORT:-${API_SERVER_PORT:-8642}}"
umask 077
cat > "$HERMES_HOME/.env" <<EOF
WHATSAPP_ENABLED=${WHATSAPP_ENABLED:-true}
WHATSAPP_MODE=${WHATSAPP_MODE:-bot}
WHATSAPP_ALLOWED_USERS=${WHATSAPP_ALLOWED_USERS:-}
WHATSAPP_ALLOW_ALL_USERS=${WHATSAPP_ALLOW_ALL_USERS:-false}
WHATSAPP_DEBUG=${WHATSAPP_DEBUG:-false}
TZ=${TZ:-Australia/Melbourne}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
GOOGLE_API_KEY=${GOOGLE_API_KEY:-}
AGENTMAIL_API_KEY=${AGENTMAIL_API_KEY:-}
DONEBEAR_TOKEN=${DONEBEAR_TOKEN:-}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}
XDG_CONFIG_HOME=${HERMES_HOME}/.config
LINEAR_API_KEY=${LINEAR_API_KEY:-}
API_SERVER_ENABLED=${API_SERVER_ENABLED:-true}
API_SERVER_KEY=${API_SERVER_KEY:-}
API_SERVER_HOST=0.0.0.0
API_SERVER_PORT=${API_PORT}
EOF
chown 10000:10000 "$HERMES_HOME/.env"
umask 022

git config --system --add safe.directory "$VAULT_DIR"

CRED_FILE="$HERMES_HOME/.git-credentials"
REPO_HOST="$(echo "$VAULT_REPO_URL" | sed 's|https://\([^/]*\).*|\1|')"
printf 'https://x-access-token:%s@%s\n' "$GITHUB_TOKEN" "$REPO_HOST" > "$CRED_FILE"
chmod 600 "$CRED_FILE"
chown 10000:10000 "$CRED_FILE"

git config --global credential.helper "store --file=$CRED_FILE"

if [ ! -d "$VAULT_DIR/.git" ]; then
  echo "Cloning vault into $VAULT_DIR..."
  git clone "$VAULT_REPO_URL" "$VAULT_DIR"
else
  echo "Updating vault in $VAULT_DIR..."
  git -C "$VAULT_DIR" pull --ff-only
fi

git -C "$VAULT_DIR" config user.name "${GIT_AUTHOR_NAME:-Hermes Bot}"
git -C "$VAULT_DIR" config user.email "${GIT_AUTHOR_EMAIL:-hermes-bot@users.noreply.github.com}"
git -C "$VAULT_DIR" config credential.helper "store --file=$CRED_FILE"

chown -R 10000:10000 "$VAULT_DIR"

if [ -n "${DATA_LAKE_REPO_URL:-}" ]; then
  git config --system --add safe.directory "$DATA_LAKE_DIR"
  if [ ! -d "$DATA_LAKE_DIR/.git" ]; then
    echo "Cloning data lake into $DATA_LAKE_DIR..."
    git clone "$DATA_LAKE_REPO_URL" "$DATA_LAKE_DIR"
  else
    echo "Updating data lake in $DATA_LAKE_DIR..."
    git -C "$DATA_LAKE_DIR" pull --ff-only
  fi
  git -C "$DATA_LAKE_DIR" config user.name "${GIT_AUTHOR_NAME:-Hermes Bot}"
  git -C "$DATA_LAKE_DIR" config user.email "${GIT_AUTHOR_EMAIL:-hermes-bot@users.noreply.github.com}"
  git -C "$DATA_LAKE_DIR" config credential.helper "store --file=$CRED_FILE"
  chown -R 10000:10000 "$DATA_LAKE_DIR"
fi

if [ -f /opt/hermes/cli-config.yaml.example ]; then
  cp /opt/hermes/cli-config.yaml.example "$HERMES_HOME/config.yaml"
  chown 10000:10000 "$HERMES_HOME/config.yaml"
fi

if [ -d /opt/hermes/docker/skills ]; then
  mkdir -p "$HERMES_HOME/skills"
  cp -r /opt/hermes/docker/skills/* "$HERMES_HOME/skills/"
  chown -R 10000:10000 "$HERMES_HOME/skills"
fi

GOOGLE_TOKEN_SOURCE="$HERMES_HOME/google-mcp-token.json"
if [ ! -f "$GOOGLE_TOKEN_SOURCE" ] && [ -n "${GOOGLE_MCP_REFRESH_TOKEN:-}" ]; then
  printf '{"refresh_token":"%s"}\n' "$GOOGLE_MCP_REFRESH_TOKEN" > "$GOOGLE_TOKEN_SOURCE"
  chown 10000:10000 "$GOOGLE_TOKEN_SOURCE"
fi
if [ -f "$GOOGLE_TOKEN_SOURCE" ]; then
  GOOGLE_TOKEN_DIR="$HERMES_HOME/.config/google-docs-mcp"
  mkdir -p "$GOOGLE_TOKEN_DIR"
  cp "$GOOGLE_TOKEN_SOURCE" "$GOOGLE_TOKEN_DIR/token.json"
  chown -R 10000:10000 "$HERMES_HOME/.config"
fi

if [ ! -f "$HERMES_HOME/crons.json" ] && [ -f /opt/hermes/docker/crons.json.seed ]; then
  cp /opt/hermes/docker/crons.json.seed "$HERMES_HOME/crons.json"
  chown 10000:10000 "$HERMES_HOME/crons.json"
fi

export DONEBEAR_TOKEN="${DONEBEAR_TOKEN:-}"

exec /opt/hermes/docker/entrypoint.sh "$@"
