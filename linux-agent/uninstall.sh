#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo ./uninstall.sh" >&2
  exit 1
fi

systemctl disable --now nexora-linux-agent.service 2>/dev/null || true
rm -f /etc/systemd/system/nexora-linux-agent.service /usr/local/libexec/nexora-linux-agent.py
systemctl daemon-reload

echo "Removed the service and executable."
echo "Configuration and HMAC secret were preserved in /etc/nexora-linux-agent."
echo "Remove that directory manually only after confirming you no longer need the secret."
