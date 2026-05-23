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
OPENAI_API_KEY=${OPENAI_API_KEY:-}
API_SERVER_ENABLED=${API_SERVER_ENABLED:-true}
API_SERVER_KEY=${API_SERVER_KEY:-}
API_SERVER_HOST=0.0.0.0
API_SERVER_PORT=${API_PORT}
BOT_DATA_DIR=${BOT_DATA_DIR:-/opt/data/tapestry}
EOF
chown 10000:10000 "$HERMES_HOME/.env"
umask 022

if [ -f /opt/hermes/cli-config.yaml.example ]; then
  cp /opt/hermes/cli-config.yaml.example "$HERMES_HOME/config.yaml"
  chown 10000:10000 "$HERMES_HOME/config.yaml"
fi

if [ -f /opt/hermes/docker/SOUL.md ]; then
  cp /opt/hermes/docker/SOUL.md "$HERMES_HOME/SOUL.md"
  chown 10000:10000 "$HERMES_HOME/SOUL.md"
fi

if [ -d /opt/hermes/docker/skills ]; then
  rm -rf "$HERMES_HOME/skills"
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
  echo '{}' > "$HERMES_HOME/profiles.json"
  chown 10000:10000 "$HERMES_HOME/profiles.json"
fi

# ---------------------------------------------------------------------------
# Tapestry: seed retrieval data + warm the embedding cache.
# ---------------------------------------------------------------------------
#
# Data lives on the persistent volume so edits survive restarts. On first
# boot, copy the baked-in seed (from `data/` in the image) onto the volume.

TAPESTRY_DATA_DIR="${BOT_DATA_DIR:-/opt/data/tapestry}"
mkdir -p "$TAPESTRY_DATA_DIR"

if [ -d /opt/tapestry/data-seed ]; then
  for f in /opt/tapestry/data-seed/*.json; do
    name=$(basename "$f")
    if [ ! -f "$TAPESTRY_DATA_DIR/$name" ]; then
      cp "$f" "$TAPESTRY_DATA_DIR/$name"
      chown 10000:10000 "$TAPESTRY_DATA_DIR/$name"
    fi
  done
fi

# Build the embedding cache so the first WhatsApp message isn't slow.
# Idempotent: if cache exists and matches, returns instantly.
if [ -f /opt/tapestry/scripts/warm_embeddings.py ] && [ -n "${OPENAI_API_KEY:-}" ]; then
  echo "[tapestry] warming embedding cache..."
  BOT_DATA_DIR="$TAPESTRY_DATA_DIR" \
    /opt/hermes/.venv/bin/python /opt/tapestry/scripts/warm_embeddings.py || true
fi

exec /opt/hermes/docker/entrypoint.sh "$@"
