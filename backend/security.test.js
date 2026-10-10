import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';

const adminSecret = `test-only-${'x'.repeat(48)}`;
let child;
let base;
async function freePort() {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}
before(async () => {
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ['server.js'], { cwd: new URL('.', import.meta.url), env: { ...process.env, PORT: String(port), NODE_ENV: 'production', CONTROL_API_KEY: adminSecret, RENDER_API_KEY: 'invalid-test-token' }, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`${base}/health`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Nexora server did not start');
});
after(() => child?.kill('SIGTERM'));

test('all management, shell, and GitHub routes reject unauthenticated requests', async () => {
  for (const path of ['/api/control/overview', '/api/control/devices', '/api/control/requests', '/api/control/security', '/api/control/keys', '/api/commands', '/api/render/services']) {
    assert.equal((await fetch(`${base}${path}`)).status, 401, path);
  }
  for (const path of ['/api/run', '/api/github/push', '/api/github/create-repo', '/api/github/connect', '/api/github/sync-commands']) {
    assert.equal((await fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })).status, 401, path);
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
  const dashboard = await fetch(`${base}/api/control/overview`, { headers: { cookie } });
  assert.equal(dashboard.status, 200);
});

test('Render endpoint stays read-only and hides upstream authentication details', async () => {
  const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json', origin: base }, body: JSON.stringify({ secret: adminSecret }) });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const response = await fetch(`${base}/api/render/services`, { headers: { cookie } });
  assert.equal(response.status, 502);
  const body = await response.text();
  assert.equal(body, JSON.stringify({ ok: false, configured: true, error: 'Unable to read Render services' }));
  assert.doesNotMatch(body, /invalid-test-token|Authorization|Bearer/);
  assert.equal((await fetch(`${base}/health`)).status, 200);
});
