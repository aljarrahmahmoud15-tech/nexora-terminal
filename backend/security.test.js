import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { createManusTask, getManusTaskProgress, MANUS_TASK_CREATE_URL, MANUS_TASK_MESSAGES_URL, MANUS_TASK_DETAIL_URL } from './manus-api.js';

const adminSecret = `test-only-${'x'.repeat(48)}`;
const hmacSecret = 'local-test-hmac-secret-never-used-outside-this-test';
const bridgeSecret = 'test-only-bridge-hmac-secret-never-used-outside-this-test';
const manusTestSecret = 'test-mock-manus-key-blocked-from-network';
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
      MANUS_API_KEY: manusTestSecret,
      NODE_OPTIONS: [process.env.NODE_OPTIONS, `--import=${new URL('./test-support/mock-manus-fetch.js', import.meta.url).href}`].filter(Boolean).join(' '),
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
  for (const pathName of ['/api/run', '/api/control/manus/tasks', '/api/control/manus/tasks/progress', '/api/github/push', '/api/github/create-repo', '/api/github/connect', '/api/github/sync-commands']) {
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

test('Manus create/progress routes are authenticated, text-only, receipt-scoped, and use only the local mock', async () => {
  const cookie = await adminCookie();
  const headers = { cookie, 'content-type': 'application/json', origin: base };
  const request = (body, extraHeaders = headers) => fetch(`${base}/api/control/manus/tasks`, {
    method: 'POST', headers: extraHeaders, body: JSON.stringify(body),
  });

  assert.equal((await request({ message: 'private task' }, { 'content-type': 'application/json', origin: base })).status, 401);
  for (const body of [{ message: '' }, { message: '  \n  ' }, { message: 'x'.repeat(10_001) }, { message: 'task', share_visibility: 'public' }, { message: 'task', endpoint: 'https://attacker.example' }, { message: 'task', attachments: [] }, { message: 'task', connectors: ['unapproved'] }, { message: 'task', oauth_scopes: ['all'] }]) {
    assert.equal((await request(body)).status, 400);
  }

  const response = await request({ message: 'Mock-only task text' });
  assert.equal(response.status, 201);
  assert.equal(response.headers.get('cache-control'), 'no-store, private');
  const created = await response.json();
  assert.deepEqual({ ok: created.ok, taskId: created.taskId, taskUrl: created.taskUrl }, { ok: true, taskId: 'task_mock_route_123', taskUrl: 'https://manus.im/app/task_mock_route_123' });
  assert.equal(typeof created.taskReceipt, 'string');
  assert.doesNotMatch(JSON.stringify(created), /MANUS_API_KEY|test-mock-manus-key|secret|Bearer/i);

  const progressResponse = await fetch(`${base}/api/control/manus/tasks/progress`, { method: 'POST', headers, body: JSON.stringify({ taskId: created.taskId, taskReceipt: created.taskReceipt }) });
  assert.equal(progressResponse.status, 200);
  assert.equal(progressResponse.headers.get('cache-control'), 'no-store, private');
  const progress = await progressResponse.json();
  assert.equal(progress.agentStatus, 'waiting');
  assert.deepEqual(progress.waiting, { eventType: 'gmailSendAction', description: 'Confirmation is required in Manus.' });
  assert.ok(progress.messages.some((message) => message.content.includes('Mock progress message')));
  assert.doesNotMatch(JSON.stringify(progress), /MANUS_API_KEY|test-mock-manus-key|secret|Bearer/i);

  const unknownTask = await fetch(`${base}/api/control/manus/tasks/progress`, { method: 'POST', headers, body: JSON.stringify({ taskId: 'task_from_elsewhere', taskReceipt: created.taskReceipt }) });
  assert.equal(unknownTask.status, 404);
  const extraFields = await fetch(`${base}/api/control/manus/tasks/progress`, { method: 'POST', headers, body: JSON.stringify({ taskId: created.taskId, taskReceipt: created.taskReceipt, endpoint: 'https://attacker.example' }) });
  assert.equal(extraFields.status, 400);
});

test('Manus transport uses the fixed endpoint, server-only API-key header, text-only prompt and private visibility with a mock', async () => {
  const testKey = 'mock-only-manus-key-never-sent-to-network';
  let captured;
  const result = await createManusTask('اكتب ملخصًا تجريبيًا', {
    apiKey: testKey,
    fetchImpl: async (url, options) => {
      captured = { url, options };
      return { ok: true, json: async () => ({ task_id: 'task_mock_123', task_url: 'https://manus.im/app/task_mock_123', share_visibility: 'public' }) };
    },
  });

  assert.equal(captured.url, MANUS_TASK_CREATE_URL);
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.headers['x-manus-api-key'], testKey);
  assert.deepEqual(JSON.parse(captured.options.body), {
    message: { content: 'اكتب ملخصًا تجريبيًا', connectors: [] },
    share_visibility: 'private',
  });
  assert.deepEqual(result, { taskId: 'task_mock_123', taskUrl: 'https://manus.im/app/task_mock_123' });
  assert.doesNotMatch(JSON.stringify(result), new RegExp(testKey));
});

test('Manus transport hides upstream error details and rejects unsafe returned task URLs', async () => {
  const testKey = 'mock-only-manus-key-never-sent-to-network';
  await assert.rejects(() => createManusTask('Mock-only task text', {
    apiKey: testKey,
    fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({ error: `unauthorized ${testKey}` }) }),
  }), (error) => error.message === 'Manus task request failed' && !error.message.includes(testKey));

  const result = await createManusTask('Mock-only task text', {
    apiKey: testKey,
    fetchImpl: async () => ({ ok: true, json: async () => ({ task_id: 'task_mock_456', task_url: 'https://attacker.example/leak' }) }),
  });
  assert.deepEqual(result, { taskId: 'task_mock_456', taskUrl: null });
});

test('Manus status polling uses only task.listMessages and presents waiting as user action without confirmation calls', async () => {
  const testKey = 'mock-only-manus-key-never-sent-to-network';
  const calls = [];
  const result = await getManusTaskProgress('task_owned_mock', {
    apiKey: testKey,
    fetchImpl: async (url, options) => {
      const parsed = new URL(url);
      calls.push({ parsed, options });
      return { ok: true, json: async () => ({
        ok: true,
        task_id: 'task_owned_mock',
        messages: [
          { id: 'waiting-event', type: 'status_update', timestamp: 1_800_000_000_000, status_update: { agent_status: 'waiting', status_detail: { waiting_for_event_type: 'unlistedAction', waiting_description: 'Open the task and act in Manus.' } } },
          { id: 'result-event', type: 'assistant_message', timestamp: 1_799_999_000_000, assistant_message: { content: `Result; key=${testKey}` } },
        ],
      }) };
    },
  });
  assert.equal(result.agentStatus, 'waiting');
  assert.deepEqual(result.waiting, { eventType: 'unlistedAction', description: 'Open the task and act in Manus.' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].parsed.origin + calls[0].parsed.pathname, new URL(MANUS_TASK_MESSAGES_URL).origin + new URL(MANUS_TASK_MESSAGES_URL).pathname);
  assert.equal(calls[0].parsed.searchParams.get('task_id'), 'task_owned_mock');
  assert.equal(calls[0].parsed.searchParams.get('order'), 'desc');
  assert.equal(calls[0].parsed.searchParams.get('limit'), '20');
  assert.equal(calls[0].options.headers['x-manus-api-key'], testKey);
  assert.equal(calls.some(({ parsed }) => parsed.pathname.includes('confirmAction')), false);
  assert.doesNotMatch(JSON.stringify(result), new RegExp(testKey));

  const running = await getManusTaskProgress('task_running_mock', {
    apiKey: testKey,
    fetchImpl: async () => ({ ok: true, json: async () => ({ ok: true, task_id: 'task_running_mock', messages: [
      { id: 'running', type: 'status_update', timestamp: 1_800_000_000_000, status_update: { agent_status: 'running', brief: 'Working in the mock.' } },
    ] }) }),
  });
  assert.equal(running.agentStatus, 'running');
  assert.equal(running.waiting, null);
});

test('stopped Manus tasks remain non-complete when background work is active or its state is omitted', async () => {
  const testKey = 'mock-only-manus-key-never-sent-to-network';
  const messagesPath = new URL(MANUS_TASK_MESSAGES_URL).pathname;
  const detailPath = new URL(MANUS_TASK_DETAIL_URL).pathname;
  for (const [backgroundValue, expected] of [[true, 'background_jobs_running'], [false, 'current_run_stopped'], [undefined, 'unknown']]) {
    const paths = [];
    const result = await getManusTaskProgress('task_stopped_mock', {
      apiKey: testKey,
      fetchImpl: async (url) => {
        const parsed = new URL(url);
        paths.push(parsed.pathname);
        if (parsed.pathname === messagesPath) return { ok: true, json: async () => ({ ok: true, task_id: 'task_stopped_mock', messages: [{ id: 'stop', type: 'status_update', timestamp: 1_800_000_000_000, status_update: { agent_status: 'stopped' } }] }) };
        const task = { id: 'task_stopped_mock', status: 'stopped' };
        if (backgroundValue !== undefined) task.has_running_background_jobs = backgroundValue;
        return { ok: true, json: async () => ({ ok: true, task }) };
      },
    });
    assert.equal(result.agentStatus, 'stopped');
    assert.equal(result.completionState, expected);
    assert.equal(result.hasRunningBackgroundJobs, backgroundValue ?? null);
    assert.deepEqual(paths, [messagesPath, detailPath]);
  }
});

test('Manus error status and messages are normalized and redact the server API key', async () => {
  const testKey = 'mock-only-manus-key-never-sent-to-network';
  const result = await getManusTaskProgress('task_error_mock', {
    apiKey: testKey,
    fetchImpl: async () => ({ ok: true, json: async () => ({ ok: true, task_id: 'task_error_mock', messages: [
      { id: 'error', type: 'error_message', timestamp: 1_800_000_000_000, error_message: { content: `Failed with ${testKey}` } },
      { id: 'status', type: 'status_update', timestamp: 1_799_999_000_000, status_update: { agent_status: 'error' } },
    ] }) }),
  });
  assert.equal(result.agentStatus, 'error');
  assert.ok(result.messages.some((message) => message.content.includes('[مخفي]')));
  assert.doesNotMatch(JSON.stringify(result), new RegExp(testKey));
});
