#!/usr/bin/env python3
import hashlib
import hmac
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

MODULE_PATH = Path(__file__).with_name("nexora-linux-agent.py")
spec = importlib.util.spec_from_file_location("nexora_linux_agent", MODULE_PATH)
agent = importlib.util.module_from_spec(spec)
spec.loader.exec_module(agent)


class LinuxAgentContractTest(unittest.TestCase):
    def setUp(self):
        self.config = {
            "url": "https://example.invalid/api/terminal/heartbeat",
            "key_id": "nexora-linux-bridge-prod",
            "device_id": "linux-router-agent",
            "version": "test",
            "region": "lab",
            "interval_seconds": 120,
            "timeout_seconds": 15,
            "secret_file": Path("/tmp/nexora-test-secret"),
        }
        self.secret = b"test-only-secret-" + b"x" * 48

    def test_request_uses_exact_utf8_body_and_server_contract(self):
        request = agent.build_request(self.config, self.secret, timestamp="1790000000")
        body = request.data
        expected = hmac.new(self.secret, b"1790000000." + body, hashlib.sha256).hexdigest()
        payload = json.loads(body)

        self.assertEqual(payload["deviceId"], "linux-router-agent")
        self.assertEqual(payload["capabilities"], ["heartbeat-only"])
        self.assertEqual(request.get_header("X-nexora-key"), "nexora-linux-bridge-prod")
        self.assertEqual(request.get_header("X-nexora-timestamp"), "1790000000")
        self.assertEqual(request.get_header("X-nexora-signature"), f"sha256={expected}")
        self.assertEqual(request.get_header("Content-type"), "application/json")

    def test_agent_declares_no_command_executor(self):
        body = json.loads(agent.heartbeat_payload(self.config))
        self.assertEqual(body["capabilities"], ["heartbeat-only"])
        self.assertNotIn("command", body)
        self.assertNotIn("exec", body)
        self.assertNotIn("router_password", body)

    def test_secret_file_allows_group_read_only_and_rejects_other_reads(self):
        with tempfile.TemporaryDirectory() as directory:
            secret_path = Path(directory) / "secret"
            secret_path.write_bytes(self.secret)
            secret_path.chmod(0o640)
            self.assertEqual(agent.read_secret(secret_path), self.secret)

            secret_path.chmod(0o644)
            with self.assertRaises(agent.ConfigurationError):
                agent.read_secret(secret_path)


if __name__ == "__main__":
    unittest.main()
