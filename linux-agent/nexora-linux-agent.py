#!/usr/bin/env python3
"""NEXORA Linux heartbeat agent.

This agent is intentionally heartbeat-only. It does not execute shell commands,
modify router settings, or expose a listening port.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
from pathlib import Path
import signal
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

LOGGER = logging.getLogger("nexora-linux-agent")
DEFAULT_SECRET_FILE = "/etc/nexora-linux-agent/secret"
DEFAULT_INTERVAL_SECONDS = 120
DEFAULT_TIMEOUT_SECONDS = 15
MIN_SECRET_BYTES = 32


class ConfigurationError(ValueError):
    """Raised when the agent configuration is unsafe or incomplete."""


def env_text(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def env_bool(name: str, default: bool = False) -> bool:
    value = env_text(name, "true" if default else "false").lower()
    if value in {"1", "true", "yes", "on"}:
        return True
    if value in {"0", "false", "no", "off"}:
        return False
    raise ConfigurationError(f"{name} must be true or false")


def env_int(name: str, default: int, minimum: int, maximum: int) -> int:
    value = env_text(name, str(default))
    try:
        parsed = int(value)
    except ValueError as exc:
        raise ConfigurationError(f"{name} must be an integer") from exc
    if not minimum <= parsed <= maximum:
        raise ConfigurationError(f"{name} must be between {minimum} and {maximum}")
    return parsed


def load_config() -> dict[str, object]:
    endpoint = env_text(
        "NEXORA_HEARTBEAT_URL",
        "https://nexora-terminal-control.onrender.com/api/terminal/heartbeat",
    )
    parsed = urlparse(endpoint)
    allow_insecure = env_bool("NEXORA_ALLOW_INSECURE_HTTP", False)
    if parsed.scheme != "https" and not (parsed.scheme == "http" and allow_insecure):
        raise ConfigurationError("NEXORA_HEARTBEAT_URL must use HTTPS")
    if not parsed.netloc or parsed.username or parsed.password or parsed.fragment:
        raise ConfigurationError("NEXORA_HEARTBEAT_URL is malformed")

    key_id = env_text("NEXORA_KEY_ID", "nexora-linux-bridge-prod")
    device_id = env_text("NEXORA_DEVICE_ID", "linux-router-agent")
    version = env_text("NEXORA_VERSION", "1.0.0")
    region = env_text("NEXORA_REGION")
    if not key_id or len(key_id) > 80 or not all(char.isalnum() or char in "_-" for char in key_id):
        raise ConfigurationError("NEXORA_KEY_ID is invalid")
    if not device_id or len(device_id) > 256:
        raise ConfigurationError("NEXORA_DEVICE_ID is invalid")
    if not version or len(version) > 80:
        raise ConfigurationError("NEXORA_VERSION is invalid")

    return {
        "url": endpoint,
        "key_id": key_id,
        "device_id": device_id,
        "version": version,
        "region": region,
        "interval_seconds": env_int("NEXORA_INTERVAL_SECONDS", DEFAULT_INTERVAL_SECONDS, 15, 86_400),
        "timeout_seconds": env_int("NEXORA_TIMEOUT_SECONDS", DEFAULT_TIMEOUT_SECONDS, 1, 60),
        "secret_file": Path(env_text("NEXORA_HMAC_SECRET_FILE", DEFAULT_SECRET_FILE)),
    }


def read_secret(secret_file: Path) -> bytes:
    if secret_file.is_symlink():
        raise ConfigurationError("NEXORA_HMAC_SECRET_FILE must not be a symlink")
    try:
        mode = secret_file.stat().st_mode & 0o777
    except FileNotFoundError as exc:
        raise ConfigurationError(f"HMAC secret file does not exist: {secret_file}") from exc
    # 0600 and 0640 are allowed; group write/execute and all other-user bits are not.
    if mode & 0o037:
        raise ConfigurationError("HMAC secret file must be readable only by its owner and group")
    secret = secret_file.read_bytes().rstrip(b"\r\n")
    if len(secret) < MIN_SECRET_BYTES:
        raise ConfigurationError(f"HMAC secret must contain at least {MIN_SECRET_BYTES} bytes")
    return secret


def heartbeat_payload(config: dict[str, object]) -> bytes:
    payload = {
        "deviceId": config["device_id"],
        "version": config["version"],
        "agent": "nexora-linux-agent",
        "capabilities": ["heartbeat-only"],
    }
    if config["region"]:
        payload["region"] = config["region"]
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def build_request(config: dict[str, object], secret: bytes, timestamp: str | None = None) -> Request:
    raw_body = heartbeat_payload(config)
    signed_timestamp = timestamp or str(int(time.time()))
    digest = hmac.new(secret, signed_timestamp.encode("utf-8") + b"." + raw_body, hashlib.sha256).hexdigest()
    return Request(
        str(config["url"]),
        data=raw_body,
        method="POST",
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "nexora-linux-agent/1.0",
            "x-nexora-key": str(config["key_id"]),
            "x-nexora-timestamp": signed_timestamp,
            "x-nexora-signature": f"sha256={digest}",
        },
    )


def send_heartbeat(config: dict[str, object], secret: bytes, opener=urlopen) -> int:
    request = build_request(config, secret)
    try:
        with opener(request, timeout=int(config["timeout_seconds"])) as response:
            status = int(response.status)
            if status < 200 or status >= 300:
                raise RuntimeError(f"heartbeat rejected with HTTP {status}")
            # The response body is intentionally not logged.
            response.read(2048)
            return status
    except HTTPError as exc:
        raise RuntimeError(f"heartbeat rejected with HTTP {exc.code}") from exc
    except URLError as exc:
        raise RuntimeError("heartbeat network request failed") from exc
    except TimeoutError as exc:
        raise RuntimeError("heartbeat request timed out") from exc


def run() -> int:
    try:
        config = load_config()
        secret = read_secret(config["secret_file"])
    except ConfigurationError as exc:
        LOGGER.error("configuration error: %s", exc)
        return 2

    stop_event = threading.Event()

    def stop(_signum, _frame):
        stop_event.set()

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    LOGGER.info("started heartbeat-only agent for device %s", config["device_id"])

    while not stop_event.is_set():
        try:
            status = send_heartbeat(config, secret)
            LOGGER.info("heartbeat accepted with HTTP %s", status)
        except RuntimeError as exc:
            LOGGER.warning("heartbeat failed: %s", exc)
        stop_event.wait(int(config["interval_seconds"]))

    LOGGER.info("stopped")
    return 0


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    raise SystemExit(run())
