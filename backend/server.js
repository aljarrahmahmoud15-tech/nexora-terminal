import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { spawn } from "node:child_process";
import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  addRequest,
  addSecurityEvent,
  createKey,
  disableKey,
  findKey,
  listDevices,
  listKeys,
  listRequests,
  listSecurityEvents,
  overview,
  upsertDevice,
} from "./control-store.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, "../frontend");
const PORT = Number(process.env.PORT || 8787);
const COMMANDS_FILE = process.env.COMMANDS_FILE || "./commands.json";
const CLOCK_SKEW = Number(process.env.HMAC_CLOCK_SKEW_SECONDS || 300);
const DANGEROUS = /[;&|`$<>]/g;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "1mb", verify: (req, _res, buffer) => { req.rawBody = Buffer.from(buffer); } }));

function loadCommands() {
  if (!fs.existsSync(COMMANDS_FILE)) return [];
  const parsed = JSON.parse(fs.readFileSync(COMMANDS_FILE, "utf-8"));
  return Array.isArray(parsed) ? parsed : [];
}
function getCommandById(id) { return loadCommands().find((command) => command.id === id); }
function sanitizeArg(value) {
  const clipped = (value === undefined || value === null ? "" : String(value)).slice(0, 800);
  if (DANGEROUS.test(clipped)) throw new Error("Argument contains disallowed characters.");
  return clipped;
}
function constantTimeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
function requestFingerprint(signature) { return signature ? `${signature.slice(0, 8)}…${signature.slice(-4)}` : "—"; }
function recordRequest(pathname, device, status, startedAt, signature) {
  addRequest({ time: new Date().toISOString().slice(11, 19), method: "POST", path: pathname, device: device || "unknown", status, latency: `${Date.now() - startedAt}ms`, hash: requestFingerprint(signature) });
}
function rejectHmac(req, res, reason, level = "high") {
  const device = req.body?.deviceId || req.body?.id || "unknown";
  recordRequest(req.path, device, "rejected", req.hmacStartedAt || Date.now(), req.headers["x-nexora-signature"]);
  addSecurityEvent({ level, title: "تم رفض توقيع HMAC", detail: `${device}: ${reason}`, code: "SIG_REJECTED" });
  return res.status(401).json({ ok: false, error: "HMAC verification failed" });
}
function requireControlKey(req, res, next) {
  const expected = process.env.CONTROL_API_KEY;
  if (!expected) return process.env.NODE_ENV === "production" ? res.status(503).json({ ok: false, error: "CONTROL_API_KEY is not configured" }) : next();
  const supplied = req.get("x-control-key") || req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!constantTimeEqual(supplied, expected)) return res.status(401).json({ ok: false, error: "Control authentication required" });
  next();
}
function requireHmac(req, res, next) {
  req.hmacStartedAt = Date.now();
  const keyId = req.get("x-nexora-key");
  const timestamp = req.get("x-nexora-timestamp");
  const signature = (req.get("x-nexora-signature") || "").replace(/^sha256=/, "");
  const key = findKey(keyId);
  if (!key || key.status !== "active") return rejectHmac(req, res, "مفتاح غير معروف أو معطل");
  const parsedTimestamp = Number(timestamp);
  if (!Number.isFinite(parsedTimestamp) || Math.abs(Date.now() / 1000 - parsedTimestamp) > CLOCK_SKEW) return rejectHmac(req, res, "الطابع الزمني خارج نافذة الصلاحية");
  const rawBody = (req.rawBody || Buffer.from("{}")).toString("utf8");
  const expected = crypto.createHmac("sha256", key.secret).update(`${timestamp}.${rawBody}`).digest("hex");
  if (!constantTimeEqual(signature, expected)) return rejectHmac(req, res, "التوقيع لا يطابق محتوى الطلب");
  key.lastUsed = new Date().toISOString();
  req.hmac = { keyId, signature, startedAt: req.hmacStartedAt };
  next();
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "nexora-command-meta-bot-node" }));

// Live admin data: protect these with CONTROL_API_KEY in production.
app.get("/api/control/overview", requireControlKey, (_req, res) => res.json(overview()));
app.get("/api/control/devices", requireControlKey, (_req, res) => res.json({ devices: listDevices() }));
app.get("/api/control/requests", requireControlKey, (_req, res) => res.json({ requests: listRequests() }));
app.get("/api/control/security", requireControlKey, (_req, res) => res.json({ events: listSecurityEvents() }));
app.get("/api/control/keys", requireControlKey, (_req, res) => res.json({ keys: listKeys() }));
app.post("/api/control/keys", requireControlKey, (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ ok: false, error: "name is required" });
  res.status(201).json({ ok: true, key: createKey(name) });
});
app.post("/api/control/keys/:id/disable", requireControlKey, (req, res) => {
  const key = disableKey(req.params.id);
  if (!key) return res.status(404).json({ ok: false, error: "Key not found" });
  res.json({ ok: true, key });
});

// Terminal ingress: HMAC-SHA256 over `${timestamp}.${rawBody}`.
app.post("/api/terminal/heartbeat", requireHmac, (req, res) => {
  const deviceId = String(req.body?.deviceId || req.body?.id || "").trim();
  if (!deviceId) return res.status(400).json({ ok: false, error: "deviceId is required" });
  const device = upsertDevice(deviceId, { status: "online", ip: req.body?.ip || undefined, version: req.body?.version || undefined, region: req.body?.region || undefined });
  recordRequest(req.path, deviceId, "verified", req.hmac.startedAt, req.hmac.signature);
  res.json({ ok: true, device, serverTime: new Date().toISOString() });
});
app.post("/api/terminal/event", requireHmac, (req, res) => {
  const deviceId = String(req.body?.deviceId || req.body?.id || "").trim();
  const level = ["high", "medium", "low"].includes(req.body?.level) ? req.body.level : "low";
  if (!deviceId || !req.body?.type) return res.status(400).json({ ok: false, error: "deviceId and type are required" });
  recordRequest(req.path, deviceId, "verified", req.hmac.startedAt, req.hmac.signature);
  if (level !== "low") addSecurityEvent({ level, title: String(req.body.type).slice(0, 120), detail: String(req.body.message || "Terminal event").slice(0, 500), code: String(req.body.code || "TERMINAL_EVENT").slice(0, 40) });
  res.status(202).json({ ok: true, accepted: true, serverTime: new Date().toISOString() });
});

app.get("/api/commands", (_req, res) => {
  const commands = loadCommands().map(({ id, title, description, exampleArgs }) => ({ id, title, description, exampleArgs: exampleArgs || {} }));
  res.json({ commands });
});
app.post("/api/run", async (req, res) => {
  try {
    const { commandId, args } = req.body || {};
    if (!commandId) return res.status(400).json({ error: "commandId is required" });
    const command = getCommandById(commandId);
    if (!command) return res.status(404).json({ error: "Command not found" });
    const safeArgs = args && typeof args === "object" ? args : {};
    const finalParams = (command.params || []).map((param) => typeof param === "string" ? param.replace(/\{\{(\w+)\}\}/g, (_, key) => sanitizeArg(safeArgs[key])) : "");
    const timeoutMs = Math.min(Number(command.timeoutMs || 120000), 300000);
    const child = spawn(command.exec, finalParams, { cwd: command.cwd || process.cwd(), env: { ...process.env, ...(command.env || {}) }, shell: false });
    let stdout = ""; let stderr = "";
    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => { stderr += data.toString(); });
    const killTimer = setTimeout(() => child.kill("SIGKILL"), timeoutMs);
    child.on("close", (code) => { clearTimeout(killTimer); res.json({ ok: code === 0, code, stdout, stderr }); });
  } catch (error) { res.status(400).json({ ok: false, error: String(error?.message || error) }); }
});

function ghRequest(method, requestPath, token, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const request = https.request({ hostname: "api.github.com", path: requestPath, method, headers: { "User-Agent": "nexora-bridge", "Accept": "application/vnd.github+json", "Authorization": `Bearer ${token}`, "Content-Type": "application/json", "Content-Length": data ? Buffer.byteLength(data) : 0 } }, (response) => {
      let buffer = "";
      response.on("data", (chunk) => { buffer += chunk.toString(); });
      response.on("end", () => { try { const json = buffer ? JSON.parse(buffer) : {}; response.statusCode >= 200 && response.statusCode < 300 ? resolve(json) : reject(new Error(json?.message || String(response.statusCode))); } catch (error) { reject(error); } });
    });
    request.on("error", reject); if (data) request.write(data); request.end();
  });
}
function ghGetSha(owner, repo, filePath, branch, token) { return ghRequest("GET", `/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`, token).then((json) => json?.sha || null); }
function ghPutContent(owner, repo, filePath, branch, token, content, message, sha) { const body = { message: message || "Update via NEXORA Bridge", content: Buffer.from(content, "utf8").toString("base64"), branch }; if (sha) body.sha = sha; return ghRequest("PUT", `/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`, token, body); }
function runGit(args, cwd) { return new Promise((resolve) => { const child = spawn("git", args, { cwd: cwd || process.cwd(), shell: false }); let stdout = ""; let stderr = ""; child.stdout.on("data", (data) => { stdout += data.toString(); }); child.stderr.on("data", (data) => { stderr += data.toString(); }); child.on("close", (code) => resolve({ code, stdout, stderr })); }); }

app.post("/api/github/sync-commands", async (_req, res) => {
  try { const owner = process.env.GITHUB_OWNER || ""; const repo = process.env.GITHUB_REPO || ""; const branch = process.env.GITHUB_BRANCH || "main"; const token = process.env.GITHUB_TOKEN || ""; const destination = process.env.GITHUB_PATH || "backend/commands.json"; if (!owner || !repo || !token) return res.status(400).json({ ok: false, error: "Missing GitHub configuration" }); const content = fs.existsSync(COMMANDS_FILE) ? fs.readFileSync(COMMANDS_FILE, "utf8") : "[]"; const sha = await ghGetSha(owner, repo, destination, branch, token).catch(() => null); const result = await ghPutContent(owner, repo, destination, branch, token, content, "Sync commands.json", sha); res.json({ ok: true, url: result?.content?.html_url || "", message: `Synced to ${owner}/${repo}:${branch}/${destination}` }); } catch (error) { res.status(400).json({ ok: false, error: String(error?.message || error) }); }
});
app.post("/api/github/create-repo", async (_req, res) => {
  try { const token = process.env.GITHUB_TOKEN || ""; const repo = process.env.GITHUB_REPO || ""; const isPrivate = String(process.env.GITHUB_PRIVATE || "true") === "true"; if (!token || !repo) return res.status(400).json({ ok: false, error: "Missing GitHub token or repo" }); await ghRequest("POST", "/user/repos", token, { name: repo, private: isPrivate, auto_init: false }).catch((error) => { if (!String(error?.message || "").includes("already exists")) throw error; }); res.json({ ok: true, message: "Repository ensured" }); } catch (error) { res.status(400).json({ ok: false, error: String(error?.message || error) }); }
});
app.post("/api/github/connect", async (_req, res) => {
  try { const token = process.env.GITHUB_TOKEN || ""; const owner = process.env.GITHUB_OWNER || ""; const repo = process.env.GITHUB_REPO || ""; const branch = process.env.GITHUB_BRANCH || "main"; const remoteName = process.env.GIT_REMOTE_NAME || "origin"; if (!token || !owner || !repo) return res.status(400).json({ ok: false, error: "Missing GitHub configuration" }); const url = `https://${token}@github.com/${owner}/${repo}.git`; await runGit(["init"]); await runGit(["config", "user.name", process.env.GIT_USER_NAME || "NEXORA"]); await runGit(["config", "user.email", process.env.GIT_USER_EMAIL || "noreply@nexora.local"]); const added = await runGit(["remote", "add", remoteName, url]); if (added.code !== 0) await runGit(["remote", "set-url", remoteName, url]); await runGit(["add", "-A"]); await runGit(["commit", "-m", "Initial commit"]); await runGit(["branch", "-M", branch]); res.json({ ok: true, message: "Connected to remote" }); } catch (error) { res.status(400).json({ ok: false, error: String(error?.message || error) }); }
});
app.post("/api/github/push", async (_req, res) => { const remoteName = process.env.GIT_REMOTE_NAME || "origin"; const branch = process.env.GIT_BRANCH || process.env.GITHUB_BRANCH || "main"; const result = await runGit(["push", "-u", remoteName, branch]); res.json({ ok: result.code === 0, code: result.code, stdout: result.stdout, stderr: result.stderr }); });

if (fs.existsSync(frontendDir)) app.use(express.static(frontendDir, { index: "index.html" }));
app.get("*", (req, res, next) => { if (req.path.startsWith("/api/")) return next(); const indexPath = path.join(frontendDir, "index.html"); if (fs.existsSync(indexPath)) return res.sendFile(indexPath); res.status(404).json({ ok: false, error: "Frontend not installed" }); });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NEXORA COMMAND · META-BOT NODE listening on :${PORT}`);
  console.log(`Commands file: ${COMMANDS_FILE}`);
});
