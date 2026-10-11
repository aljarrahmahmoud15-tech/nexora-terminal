import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const adminSecret = `test-only-${'x'.repeat(48)}`;
const hmacSecret = 'local-test-hmac-secret-never-used-outside-this-test';
const bridgeSecret = 'test-only-bridge-hmac-secret-never-used-outside-this-test';
const actionCommandId = 'test_local_restart';
let child;
let base;
let tempDir;
let commandsFile;
async function freePort() {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}
async function adminCookie() {
  const response = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json', origin: base }, body: JSON.stringify({ secret: adminSecret }) });
  assert.equal(response.status, 200);
  return response.headers.get('set-cookie').split(';')[0];
}
before(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexora-bridge-test-'));
  commandsFile = path.join(tempDir, 'commands.json');
  fs.writeFileSync(commandsFile, JSON.stringify([{
    id: actionCommandId,
    title: 'Local harmless test action',
    description: 'Writes fixed text; this test does not touch a service or remote host.',
    exec: process.execPath,
    params: ['-e', "process.stdout.write('whitelist-ok')"],
    timeoutMs: 3000,
    serviceAction: { operation: 'restart', service: 'test-only-no-service' },
    exampleArgs: { internalNote: 'CANARY_SECRET_SHOULD_STAY_SERVER_SIDE' },
  }, {
    id: 'test_safe_argument',
    title: 'Local argument test',
    exec: process.execPath,
    params: ['-e', 'process.stdout.write(process.argv[1] || "")', '{{value}}'],
    exampleArgs: { internalNote: 'CANARY_SECRET_SHOULD_STAY_SERVER_SIDE' },
  }]));
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ['server.js'], {
    cwd: new URL('.', import.meta.url),
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: 'production',
      CONTROL_API_KEY: adminSecret,
      COMMANDS_FILE: commandsFile,
      NEXORA_KEYS_JSON: JSON.stringify([{ name: 'test-terminal', id: 'test-key', secret: hmacSecret, status: 'active' }]),
      NEXORA_BRIDGE_HMAC_SECRET: bridgeSecret,
      OPENROUTER_API_KEY: '',
      OPENROUTER_MODEL: '',
    },
    stdio: 'ignore',
  });
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`${base}/health`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Nexora server did not start');
});
after(() => {
  child?.kill('SIGTERM');
  if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
});

test('all management, command, and GitHub routes reject unauthenticated requests', async () => {
  for (const pathName of ['/api/control/overview', '/api/control/devices', '/api/control/requests', '/api/control/security', '/api/control/keys', '/api/control/executions', '/api/control/openrouter/status', '/api/commands', '/api/render/services']) {
    assert.equal((await fetch(`${base}${pathName}`)).status, 401, pathName);
  }
  for (const pathName of ['/api/run', '/api/github/push', '/api/github/create-repo', '/api/github/connect', '/api/github/sync-commands']) {
    assert.equal((await fetch(`${base}${pathName}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })).status, 401, pathName);
  }
});

test('login rejects cross-origin and invalid credentials, then issues a secure HttpOnly session', async () => {
  const payload = { method: 'POST', headers: { 'content-type': 'application/json', origin: `${base}` }, body: JSON.stringify({ secret: adminSecret }) };
  assert.equal((await fetch(`${base}/api/auth/login`, { ...payload, headers: { ...payload.headers, origin: 'https://evil.example' } })).status, 403);
  assert.equal((await fetch(`${base}/api/auth/login`, { ...payload, body: JSON.stringify({ secret: 'wrong' }) })).status, 401);
  const response = await fetch(`${base}/api/auth/login`, payload);
  assert.equal(response.status, 200);
  const cookieHeader = response.headers.get('set-cookie');
  assert.match(cookieHeader, /HttpOnly/);
  assert.match(cookieHeader, /SameSite=Strict/);
  assert.match(cookieHeader, /Secure/);
  const cookie = cookieHeader.split(';')[0];
  assert.deepEqual(await (await fetch(`${base}/api/auth/session`, { headers: { cookie } })).json(), { configured: true, authenticated: true });
  assert.equal((await fetch(`${base}/api/control/overview`, { headers: { cookie } })).status, 200);
});

test('command catalog exposes only the whitelist, requires explicit service confirmation, and audits local execution', async () => {
  const cookie = await adminCookie();
  const catalogResponse = await fetch(`${base}/api/commands`, { headers: { cookie } });
  assert.equal(catalogResponse.status, 200);
  const catalog = await catalogResponse.json();
  assert.equal(catalog.configured, true);
  assert.equal(catalog.commands.length, 2);
  assert.equal(catalog.commands[0].id, actionCommandId);
  assert.equal('exec' in catalog.commands[0], false);
  assert.equal('params' in catalog.commands[0], false);
  assert.equal('exampleArgs' in catalog.commands[0], false);
  assert.doesNotMatch(JSON.stringify(catalog), /CANARY_SECRET_SHOULD_STAY_SERVER_SIDE/);

  const unconfirmed = await fetch(`${base}/api/run`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ commandId: actionCommandId }) });
  assert.equal(unconfirmed.status, 428);
  assert.equal((await unconfirmed.json()).confirmationRequired, true);

  const confirmed = await fetch(`${base}/api/run`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ commandId: actionCommandId, confirmedCommandId: actionCommandId }) });
  assert.equal(confirmed.status, 200);
  const result = await confirmed.json();
  assert.equal(result.ok, true);
  assert.equal(result.stdout, 'whitelist-ok');
  assert.equal(result.operation, 'restart');

  const safeArgument = await fetch(`${base}/api/run`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ commandId: 'test_safe_argument', args: { value: 'plain operator value' } }) });
  assert.equal(safeArgument.status, 200);
  assert.equal((await safeArgument.json()).stdout, 'plain operator value');
  const unsafeArgument = await fetch(`${base}/api/run`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ commandId: 'test_safe_argument', args: { value: '$(not-allowed)' } }) });
  assert.equal(unsafeArgument.status, 400);

  const logResponse = await fetch(`${base}/api/control/executions`, { headers: { cookie } });
  const { executions, retention } = await logResponse.json();
  assert.match(retention, /ذاكرة/);
  const statuses = executions.map((entry) => entry.status);
  assert.ok(statuses.includes('rejected'));
  assert.ok(statuses.includes('success'));
  assert.ok(statuses.includes('confirmation_required'));
  assert.equal(executions.find((entry) => entry.service === 'test-only-no-service').status, 'success');
});

test('OpenRouter status is authenticated, reports unconfigured and untested state, and never returns a key', async () => {
  const cookie = await adminCookie();
  const response = await fetch(`${base}/api/control/openrouter/status`, { headers: { cookie } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store, private');
  const body = await response.json();
  assert.deepEqual(body, { configured: false, model: null, lastTest: { status: 'not_run', testedAt: null } });
  assert.doesNotMatch(JSON.stringify(body), /OPENROUTER_API_KEY|secret|Bearer/i);
});

test('telemetry starts empty and only a valid HMAC heartbeat creates a live device', async () => {
  const cookie = await adminCookie();
  const initial = await (await fetch(`${base}/api/control/overview`, { headers: { cookie } })).json();
  assert.equal(initial.devices.total, 0);
  assert.equal(initial.telemetry.configured, true);
  assert.equal(initial.telemetry.heartbeatReceived, false);
  assert.deepEqual((await (await fetch(`${base}/api/control/devices`, { headers: { cookie } })).json()).devices, []);

  const payload = JSON.stringify({ deviceId: 'local-test-terminal', version: 'test-only' });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = crypto.createHmac('sha256', hmacSecret).update(`${timestamp}.${payload}`).digest('hex');
  const heartbeat = await fetch(`${base}/api/terminal/heartbeat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-nexora-key': 'test-key', 'x-nexora-timestamp': timestamp, 'x-nexora-signature': `sha256=${signature}` },
    body: payload,
  });
  assert.equal(heartbeat.status, 200);
  const after = await (await fetch(`${base}/api/control/overview`, { headers: { cookie } })).json();
  assert.equal(after.devices.total, 1);
  assert.equal(after.telemetry.heartbeatReceived, true);
  assert.equal(after.devices.online, 1);
});

test('bridge env key is merged, accepts only a valid HMAC, and never exposes its secret', async () => {
  const payload = JSON.stringify({ deviceId: 'bridge-env-test-terminal', type: 'bridge-test' });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = crypto.createHmac('sha256', bridgeSecret).update(`${timestamp}.${payload}`).digest('hex');
  const accepted = await fetch(`${base}/api/terminal/heartbeat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-nexora-key': 'nexora-linux-bridge-prod', 'x-nexora-timestamp': timestamp, 'x-nexora-signature': `sha256=${signature}` },
    body: payload,
  });
  assert.equal(accepted.status, 200);

  const invalidSignature = crypto.createHmac('sha256', 'incorrect-bridge-secret').update(`${timestamp}.${payload}`).digest('hex');
  const rejected = await fetch(`${base}/api/terminal/event`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-nexora-key': 'nexora-linux-bridge-prod', 'x-nexora-timestamp': timestamp, 'x-nexora-signature': `sha256=${invalidSignature}` },
    body: payload,
  });
  assert.equal(rejected.status, 401);

  const cookie = await adminCookie();
  const keyResponse = await fetch(`${base}/api/control/keys`, { headers: { cookie } });
  assert.equal(keyResponse.status, 200);
  const listedKeys = (await keyResponse.json()).keys;
  assert.deepEqual(new Set(listedKeys.map((key) => key.id)), new Set(['test-key', 'nexora-linux-bridge-prod']));
  assert.equal(listedKeys.find((key) => key.id === 'nexora-linux-bridge-prod').name, 'nexora-linux-bridge-prod');
  assert.equal(JSON.stringify(listedKeys).includes(bridgeSecret), false);
});

test('Render remains read-only and does not contact upstream when its server key is absent', async () => {
  const cookie = await adminCookie();
  const response = await fetch(`${base}/api/render/services`, { headers: { cookie } });
  assert.equal(response.status, 503);
  const body = await response.text();
  assert.equal(body, JSON.stringify({ ok: false, configured: false, error: 'Render API key is not configured' }));
  assert.doesNotMatch(body, /Authorization|Bearer/);
  assert.equal((await fetch(`${base}/health`)).status, 200);
});
