#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo ./install.sh" >&2
  exit 1
fi

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
CONFIG_DIR=/etc/nexora-linux-agent
LIBEXEC_DIR=/usr/local/libexec
SERVICE_NAME=nexora-linux-agent
AGENT_USER=nexora-agent

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required" >&2
  exit 1
fi

python3 - <<'PY'
import sys
if sys.version_info < (3, 9):
    raise SystemExit("Python 3.9 or newer is required")
PY

if ! getent group "$AGENT_USER" >/dev/null 2>&1; then
  groupadd --system "$AGENT_USER"
fi
if ! id -u "$AGENT_USER" >/dev/null 2>&1; then
  useradd --system --gid "$AGENT_USER" --home-dir /nonexistent --no-create-home --shell /usr/sbin/nologin "$AGENT_USER"
fi

install -d -o root -g "$AGENT_USER" -m 0750 "$CONFIG_DIR"
install -d -o root -g root -m 0755 "$LIBEXEC_DIR"
install -o root -g root -m 0755 "$SCRIPT_DIR/nexora-linux-agent.py" "$LIBEXEC_DIR/nexora-linux-agent.py"
install -o root -g root -m 0644 "$SCRIPT_DIR/nexora-linux-agent.service" "/etc/systemd/system/$SERVICE_NAME.service"

if [[ ! -e "$CONFIG_DIR/agent.env" ]]; then
  install -o root -g "$AGENT_USER" -m 0640 "$SCRIPT_DIR/nexora-linux-agent.env.example" "$CONFIG_DIR/agent.env"
fi
if [[ ! -e "$CONFIG_DIR/secret" ]]; then
  install -o root -g "$AGENT_USER" -m 0640 /dev/null "$CONFIG_DIR/secret"
fi

systemctl daemon-reload

echo "Installed $SERVICE_NAME."
echo "1. Edit $CONFIG_DIR/agent.env."
echo "2. Put the same NEXORA HMAC secret in $CONFIG_DIR/secret; do not paste it into chat or Git."
echo "3. Verify: sudo chmod 0640 $CONFIG_DIR/secret && sudo chown root:$AGENT_USER $CONFIG_DIR/secret"
echo "4. Start: sudo systemctl enable --now $SERVICE_NAME"
echo "5. Logs: sudo journalctl -u $SERVICE_NAME -f"
