import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const commandsFile = path.join(backendDir, "commands.json");
const adminSecret = `catalog-test-${"x".repeat(48)}`;
let child;
let base;

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function adminCookie() {
  const response = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: base },
    body: JSON.stringify({ secret: adminSecret }),
  });
  assert.equal(response.status, 200);
  return response.headers.get("set-cookie").split(";")[0];
}

before(async () => {
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ["server.js"], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: "test",
      CONTROL_API_KEY: adminSecret,
      COMMANDS_FILE: commandsFile,
      NEXORA_BRIDGE_JOBS_MODE: "single_instance_memory",
      NEXORA_BRIDGE_HMAC_SECRET: `catalog-test-bridge-${"x".repeat(48)}`,
      OPENROUTER_API_KEY: "",
      MANUS_API_KEY: "",
    },
    stdio: "ignore",
  });

  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      if ((await fetch(`${base}/health`)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("NEXORA server did not start for command catalog test");
});

after(() => {
  child?.kill("SIGTERM");
});

test("production command catalog is configured and exposes only public metadata", async () => {
  const cookie = await adminCookie();
  const response = await fetch(`${base}/api/commands`, { headers: { cookie } });
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.deepEqual({ configured: body.configured, reason: body.reason }, { configured: true, reason: "ready" });
  assert.ok(Array.isArray(body.commands));

  const runtimeInfo = body.commands.find((command) => command.id === "runtime_info");
  assert.ok(runtimeInfo, "runtime_info must remain in the reviewed catalog");
  assert.equal(runtimeInfo.builtin, "runtime_info");
  assert.deepEqual(runtimeInfo.inputs, []);

  for (const command of body.commands) {
    assert.equal("exec" in command, false);
    assert.equal("params" in command, false);
    assert.equal("cwd" in command, false);
    assert.equal("env" in command, false);
    assert.equal("internalJob" in command, false);
  }
});

test("catalog executes runtime_info and rejects unknown or parameterized built-ins", async () => {
  const cookie = await adminCookie();
  const headers = { cookie, "content-type": "application/json" };

  const response = await fetch(`${base}/api/run`, {
    method: "POST",
    headers,
    body: JSON.stringify({ commandId: "runtime_info" }),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.ok, true);
  assert.equal(result.commandId, "runtime_info");
  assert.equal(result.operation, "builtin");
  const runtime = JSON.parse(result.stdout);
  assert.equal(runtime.service, "nexora-terminal-control");
  assert.match(runtime.node, /^v\d+\.\d+\.\d+$/);
  assert.equal(typeof runtime.uptimeSeconds, "number");

  const unknown = await fetch(`${base}/api/run`, {
    method: "POST",
    headers,
    body: JSON.stringify({ commandId: "not_in_catalog" }),
  });
  assert.equal(unknown.status, 404);

  const withArgs = await fetch(`${base}/api/run`, {
    method: "POST",
    headers,
    body: JSON.stringify({ commandId: "runtime_info", args: { value: "unexpected" } }),
  });
  assert.equal(withArgs.status, 400);
});

// Keep the production fixture readable by the test runner and fail clearly if it disappears.
assert.ok(fs.existsSync(commandsFile), `Missing command catalog: ${commandsFile}`);
