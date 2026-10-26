import test from "node:test";
import assert from "node:assert/strict";
import { createTelegramWebhookHandler, getTelegramConfig, parseTelegramCommand } from "./telegram-control.js";

const token = "123456789:" + "A".repeat(32);
const secret = "telegram-webhook-secret-" + "x".repeat(32);
const env = {
  TELEGRAM_ENABLED: "1",
  TELEGRAM_BOT_TOKEN: token,
  TELEGRAM_WEBHOOK_SECRET: secret,
  TELEGRAM_ALLOWED_CHAT_IDS: "-100123,456789",
};

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
}

function request(update, webhookSecret = secret) {
  return {
    body: update,
    get(name) { return name.toLowerCase() === "x-telegram-bot-api-secret-token" ? webhookSecret : ""; },
  };
}

function telegramFetchRecorder(calls) {
  return async (url, options) => {
    calls.push({ url, options });
    return { ok: true, status: 200, json: async () => ({ ok: true, result: { message_id: 1 } }) };
  };
}

test("Telegram remains disabled unless explicitly configured with token, secret, and chat allowlist", () => {
  assert.equal(getTelegramConfig({}).enabled, false);
  assert.equal(getTelegramConfig({ ...env, TELEGRAM_ENABLED: "0" }).enabled, false);
  assert.equal(getTelegramConfig({ ...env, TELEGRAM_ALLOWED_CHAT_IDS: "" }).enabled, false);
  assert.equal(getTelegramConfig(env).enabled, true);
});

test("Telegram command parser accepts only read-only commands without arguments", () => {
  assert.deepEqual(parseTelegramCommand("/runtime_info"), { command: "runtime_info" });
  assert.deepEqual(parseTelegramCommand("/health_check@NexoraBot"), { command: "health_check" });
  assert.deepEqual(parseTelegramCommand("/help"), { command: "help" });
  assert.equal(parseTelegramCommand("/restart").command, null);
  assert.equal(parseTelegramCommand("/runtime_info now").error, "arguments_not_supported");
  assert.equal(parseTelegramCommand("hello").error, "command_required");
});

test("Telegram webhook rejects invalid secret and non-allowlisted chats", async () => {
  const handler = createTelegramWebhookHandler({ env, executeCommand: async () => ({ ok: true, stdout: "no-op" }) });
  const badSecret = responseRecorder();
  await handler(request({ update_id: 1, message: { chat: { id: 456789 }, text: "/help" } }, "wrong"), badSecret);
  assert.equal(badSecret.statusCode, 401);

  const blockedChat = responseRecorder();
  await handler(request({ update_id: 2, message: { chat: { id: 999999 }, text: "/help" } }), blockedChat);
  assert.equal(blockedChat.statusCode, 403);
});

test("Telegram runs runtime_info through the supplied safe runner and replies without exposing configuration", async () => {
  const calls = [];
  const executed = [];
  const handler = createTelegramWebhookHandler({
    env,
    executeCommand: async (command) => { executed.push(command); return { ok: true, stdout: '{"service":"nexora-terminal-control"}' }; },
    fetchImpl: telegramFetchRecorder(calls),
  });
  const result = responseRecorder();
  await handler(request({ update_id: 3, message: { chat: { id: 456789 }, text: "/runtime_info" } }), result);
  assert.equal(result.statusCode, 200);
  assert.deepEqual(executed, ["runtime_info"]);
  assert.deepEqual(result.body, { ok: true, handled: true, command: "runtime_info" });
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /api\.telegram\.org\/bot/);
  assert.equal(JSON.parse(calls[0].options.body).chat_id, 456789);
  assert.match(JSON.parse(calls[0].options.body).text, /nexora-terminal-control/);
});

test("Telegram deduplicates update IDs and never exposes mutating commands", async () => {
  const calls = [];
  const executed = [];
  const handler = createTelegramWebhookHandler({
    env,
    executeCommand: async (command) => { executed.push(command); return { ok: true, stdout: "ok" }; },
    fetchImpl: telegramFetchRecorder(calls),
  });
  const update = { update_id: 4, message: { chat: { id: -100123 }, text: "/health_check" } };
  const first = responseRecorder();
  const second = responseRecorder();
  await handler(request(update), first);
  await handler(request(update), second);
  assert.equal(first.statusCode, 200);
  assert.deepEqual(second.body, { ok: true, duplicate: true });
  assert.deepEqual(executed, ["health_check"]);
  assert.equal(calls.length, 1);

  const unsupported = responseRecorder();
  await handler(request({ update_id: 5, message: { chat: { id: -100123 }, text: "/restart" } }), unsupported);
  assert.equal(unsupported.statusCode, 200);
  assert.deepEqual(unsupported.body, { ok: true, handled: false, reason: "unsupported_command" });
  assert.equal(executed.length, 1);
});
