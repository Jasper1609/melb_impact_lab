FROM nousresearch/hermes-agent:latest

RUN cd /opt/hermes/scripts/whatsapp-bridge && npm install --omit=dev

# Hermes already ships Anthropic. We add: faster-whisper for voice STT,
# openai for embeddings, numpy for vector math, python-dotenv for .env loading.
# These power the consolidated tapestry skill — see skills/tapestry/SKILL.md.
RUN uv pip install --python /opt/hermes/.venv/bin/python \
    faster-whisper \
    openai \
    numpy \
    python-dotenv

COPY entrypoint.sh /opt/hermes/docker/custom-entrypoint.sh
RUN chmod +x /opt/hermes/docker/custom-entrypoint.sh

COPY SOUL.md /opt/hermes/docker/SOUL.md
COPY config.yaml.example /opt/hermes/cli-config.yaml.example
COPY skills/ /opt/hermes/docker/skills/
COPY src/data/ /opt/hermes/docker/data/

# Tapestry retrieval scripts (Python CLI tools called by the tapestry skill)
# + Tapestry data (profiles / businesses / cafes / landmarks / events JSON).
# Path conventions:
#   /opt/tapestry/scripts   — Python CLI tools
#   /opt/data/data          — Hermes-style data dir (already used for community.json)
#   /opt/data/tapestry      — Tapestry profiles + reference JSONs + embedding cache
# At runtime, entrypoint.sh seeds /opt/data/tapestry from /opt/tapestry/data-seed
# so the JSON files end up on the persistent volume.
COPY scripts/ /opt/tapestry/scripts/
COPY data/ /opt/tapestry/data-seed/

ENTRYPOINT ["/usr/bin/tini", "-g", "--", "/opt/hermes/docker/custom-entrypoint.sh"]
CMD ["gateway", "run"]
