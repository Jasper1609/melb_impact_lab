#!/usr/bin/env bash
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-/opt/data}"

: "${ANTHROPIC_API_KEY:?ERROR: ANTHROPIC_API_KEY is not set}"

mkdir -p "$HERMES_HOME"

API_PORT="${PORT:-${API_SERVER_PORT:-8642}}"
umask 077
cat > "$HERMES_HOME/.env" <<EOF
WHATSAPP_ENABLED=${WHATSAPP_ENABLED:-true}
WHATSAPP_MODE=${WHATSAPP_MODE:-bot}
WHATSAPP_ALLOWED_USERS=${WHATSAPP_ALLOWED_USERS:-*}
WHATSAPP_ALLOW_ALL_USERS=${WHATSAPP_ALLOW_ALL_USERS:-true}
WHATSAPP_HOME_CHANNEL=${WHATSAPP_HOME_CHANNEL:-dummy}
WHATSAPP_DEBUG=${WHATSAPP_DEBUG:-false}
TZ=${TZ:-Australia/Melbourne}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
API_SERVER_ENABLED=${API_SERVER_ENABLED:-true}
API_SERVER_KEY=${API_SERVER_KEY:-}
API_SERVER_HOST=0.0.0.0
API_SERVER_PORT=${API_PORT}
BE_URL=${BE_URL:-http://host.docker.internal:8765}
EOF
chown 10000:10000 "$HERMES_HOME/.env"
umask 022

if [ -f /opt/hermes/cli-config.yaml.example ]; then
  cp /opt/hermes/cli-config.yaml.example "$HERMES_HOME/config.yaml"
  chown 10000:10000 "$HERMES_HOME/config.yaml"
fi

if [ -d /opt/hermes/docker/skills ]; then
  mkdir -p "$HERMES_HOME/skills"
  cp -r /opt/hermes/docker/skills/* "$HERMES_HOME/skills/"
  chown -R 10000:10000 "$HERMES_HOME/skills"
fi

if [ -d /opt/hermes/docker/data ] && [ ! -d "$HERMES_HOME/data" ]; then
  mkdir -p "$HERMES_HOME/data"
  cp -r /opt/hermes/docker/data/* "$HERMES_HOME/data/"
  chown -R 10000:10000 "$HERMES_HOME/data"
fi

if [ ! -f "$HERMES_HOME/profiles.json" ]; then
  if [ -f /opt/hermes/docker/data/profiles.json ]; then
    cp /opt/hermes/docker/data/profiles.json "$HERMES_HOME/profiles.json"
  else
    echo '{}' > "$HERMES_HOME/profiles.json"
  fi
  chown 10000:10000 "$HERMES_HOME/profiles.json"
fi

exec /opt/hermes/docker/entrypoint.sh "$@"
