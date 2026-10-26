import crypto from "node:crypto";

const MAX_UPDATE_CACHE = 500;
const MAX_MESSAGE_LENGTH = 200;
const MAX_REPLY_LENGTH = 3900;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_PER_CHAT = 30;
const SECRET_MIN_LENGTH = 32;

export const TELEGRAM_READ_ONLY_COMMANDS = Object.freeze({
  help: "help",
  commands: "help",
  runtime_info: "runtime_info",
  health_check: "health_check",
});

function constantTimeEqual(left, right) {
  const leftHash = crypto.createHash("sha256").update(String(left || "")).digest();
  const rightHash = crypto.createHash("sha256").update(String(right || "")).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

function parseAllowedChatIds(value) {
  return new Set(String(value || "").split(",").map((item) => item.trim()).filter((item) => /^-?\d+$/.test(item)));
}

export function getTelegramConfig(env = process.env) {
  const token = typeof env.TELEGRAM_BOT_TOKEN === "string" ? env.TELEGRAM_BOT_TOKEN.trim() : "";
  const webhookSecret = typeof env.TELEGRAM_WEBHOOK_SECRET === "string" ? env.TELEGRAM_WEBHOOK_SECRET.trim() : "";
  const allowedChatIds = parseAllowedChatIds(env.TELEGRAM_ALLOWED_CHAT_IDS);
  const tokenLooksValid = /^\d+:[A-Za-z0-9_-]{20,}$/.test(token);
  const enabled = env.TELEGRAM_ENABLED === "1"
    && tokenLooksValid
    && webhookSecret.length >= SECRET_MIN_LENGTH
    && allowedChatIds.size > 0;
  return { enabled, token, webhookSecret, allowedChatIds };
}

export function parseTelegramCommand(text) {
  if (typeof text !== "string" || text.length === 0 || text.length > MAX_MESSAGE_LENGTH) return { command: null, error: "invalid_message" };
  const parts = text.trim().split(/\s+/);
  const raw = parts.shift() || "";
  const match = raw.match(/^\/([A-Za-z0-9_]{1,64})(?:@[A-Za-z0-9_]{1,64})?$/);
  if (!match) return { command: null, error: "command_required" };
  if (parts.length) return { command: null, error: "arguments_not_supported" };
  const command = match[1].toLowerCase();
  return TELEGRAM_READ_ONLY_COMMANDS[command] ? { command } : { command: null, error: "unsupported_command" };
}

function truncate(value, max = MAX_REPLY_LENGTH) {
  const text = String(value || "");
  return text.length <= max ? text : `${text.slice(0, max - 24)}\n…تم اختصار النتيجة.`;
}

function helpText() {
  return [
    "أوامر NEXORA الآمنة:",
    "/runtime_info — معلومات عملية NEXORA",
    "/health_check — فحص صحة المشغّل المحلي",
    "/help — عرض هذه القائمة",
    "",
    "الأوامر التي تغيّر الحالة غير متاحة عبر Telegram.",
  ].join("\n");
}

function resultText(command, result) {
  if (!result || result.ok !== true) return `فشل الأمر ${command}: ${String(result?.error || "خطأ غير معروف")}`;
  const output = String(result.stdout || "").trim();
  return `نجح الأمر ${command}.\n${truncate(output || "بدون مخرجات")}`;
}

async function sendTelegramMessage({ token, chatId, text, fetchImpl = fetch }) {
  const response = await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: truncate(text) }),
    signal: AbortSignal.timeout(8_000),
    redirect: "error",
  });
  let body = null;
  try { body = await response.json(); } catch {}
  if (!response.ok || body?.ok !== true) throw new Error("Telegram message delivery failed");
  return body;
}

export function createTelegramWebhookHandler({ env = process.env, executeCommand, fetchImpl = fetch, now = () => Date.now(), logger = console } = {}) {
  const seenUpdates = new Map();
  const rateByChat = new Map();
  const rememberUpdate = (updateId) => {
    if (!Number.isInteger(updateId)) return false;
    const previous = seenUpdates.has(updateId);
    if (!previous) {
      if (seenUpdates.size >= MAX_UPDATE_CACHE) seenUpdates.delete(seenUpdates.keys().next().value);
      seenUpdates.set(updateId, now());
    }
    return previous;
  };
  const rateAllowed = (chatId) => {
    const current = now();
    const previous = rateByChat.get(chatId);
    if (!previous || current - previous.startedAt >= RATE_WINDOW_MS) {
      rateByChat.set(chatId, { startedAt: current, count: 1 });
      return true;
    }
    if (previous.count >= RATE_LIMIT_PER_CHAT) return false;
    previous.count += 1;
    return true;
  };

  return async function telegramWebhook(req, res) {
    const config = getTelegramConfig(env);
    if (!config.enabled) return res.status(503).json({ ok: false, configured: false, error: "Telegram integration is disabled" });
    const suppliedSecret = req.get("x-telegram-bot-api-secret-token") || "";
    if (!constantTimeEqual(suppliedSecret, config.webhookSecret)) return res.status(401).json({ ok: false, error: "Telegram webhook authentication failed" });
    const update = req.body;
    if (!update || typeof update !== "object" || Array.isArray(update)) return res.status(400).json({ ok: false, error: "Invalid Telegram update" });
    if (rememberUpdate(update.update_id)) return res.json({ ok: true, duplicate: true });

    const message = update.message;
    const chatId = message?.chat?.id;
    if ((typeof chatId !== "number" && typeof chatId !== "string") || !config.allowedChatIds.has(String(chatId))) {
      return res.status(403).json({ ok: false, error: "Telegram chat is not allowlisted" });
    }
    if (!rateAllowed(String(chatId))) return res.status(429).json({ ok: false, error: "Telegram rate limit exceeded" });
    const parsed = parseTelegramCommand(message.text);
    if (!parsed.command) {
      try { await sendTelegramMessage({ token: config.token, chatId, text: helpText(), fetchImpl }); } catch { return res.status(502).json({ ok: false, error: "Telegram reply failed" }); }
      return res.json({ ok: true, handled: false, reason: parsed.error });
    }
    if (parsed.command === "help") {
      try { await sendTelegramMessage({ token: config.token, chatId, text: helpText(), fetchImpl }); } catch { return res.status(502).json({ ok: false, error: "Telegram reply failed" }); }
      return res.json({ ok: true, handled: true, command: parsed.command });
    }
    if (typeof executeCommand !== "function") return res.status(503).json({ ok: false, error: "Telegram command runner is unavailable" });
    try {
      const result = await executeCommand(parsed.command);
      await sendTelegramMessage({ token: config.token, chatId, text: resultText(parsed.command, result), fetchImpl });
      return res.json({ ok: true, handled: true, command: parsed.command });
    } catch (error) {
      logger.warn?.(`[Telegram] read-only command failed: ${parsed.command}`);
      return res.status(502).json({ ok: false, error: "Telegram command failed" });
    }
  };
}

export const telegramTesting = Object.freeze({
  constantTimeEqual,
  parseAllowedChatIds,
  helpText,
  resultText,
  maxReplyLength: MAX_REPLY_LENGTH,
});
