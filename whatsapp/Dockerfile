FROM nousresearch/hermes-agent:latest

RUN cd /opt/hermes/scripts/whatsapp-bridge && npm install --omit=dev
RUN npm install -g donebear

COPY entrypoint.sh /opt/hermes/docker/custom-entrypoint.sh
RUN chmod +x /opt/hermes/docker/custom-entrypoint.sh

COPY SOUL.md /opt/hermes/docker/SOUL.md
COPY config.yaml.example /opt/hermes/cli-config.yaml.example
COPY skills/ /opt/hermes/docker/skills/
COPY crons.json.seed /opt/hermes/docker/crons.json.seed

ENTRYPOINT ["/usr/bin/tini", "-g", "--", "/opt/hermes/docker/custom-entrypoint.sh"]
CMD ["gateway", "run"]
