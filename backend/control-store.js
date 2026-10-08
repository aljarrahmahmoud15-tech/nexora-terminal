import crypto from "node:crypto";

const now = () => new Date().toISOString();

const seedDevices = [
  { id: "NX-00421", name: "محطة الرياض — البوابة الشمالية", type: "Kiosk Prime", status: "online", lastSeen: now(), ip: "10.24.8.41", version: "2.8.1", region: "الرياض" },
  { id: "NX-00419", name: "محطة جدة — صالة الوصول", type: "Kiosk Prime", status: "online", lastSeen: now(), ip: "10.24.6.18", version: "2.8.1", region: "جدة" },
  { id: "NX-00388", name: "محطة الدمام — المدخل الرئيسي", type: "Terminal Edge", status: "warning", lastSeen: new Date(Date.now() - 4 * 60_000).toISOString(), ip: "10.18.3.72", version: "2.7.9", region: "الدمام" },
  { id: "NX-00352", name: "محطة أبوظبي — المبنى B", type: "Terminal Edge", status: "offline", lastSeen: new Date(Date.now() - 2 * 60 * 60_000).toISOString(), ip: "10.16.4.09", version: "2.7.8", region: "أبوظبي" },
  { id: "NX-00341", name: "محطة دبي — مركز العمليات", type: "Kiosk Prime", status: "online", lastSeen: new Date(Date.now() - 8 * 60_000).toISOString(), ip: "10.12.9.11", version: "2.8.1", region: "دبي" },
];

const devices = new Map(seedDevices.map((device) => [device.id, device]));
const requests = [];
const securityEvents = [];

function loadKeys() {
  try {
    const parsed = JSON.parse(process.env.NEXORA_KEYS_JSON || "[]");
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    // Keep an empty key set when production configuration is invalid.
  }
  if (process.env.NODE_ENV === "production") return [];
  return [{ name: "local-demo", id: "key_demo", secret: "change-me-in-env", status: "active", created: now(), lastUsed: null }];
}
const keys = new Map(loadKeys().map((key) => [key.id, key]));

export function publicKey(key) {
  return { name: key.name, id: key.id, created: key.created, status: key.status, lastUsed: key.lastUsed };
}

export function listKeys() { return [...keys.values()].map(publicKey); }
export function createKey(name) {
  const id = `key_live_${crypto.randomBytes(5).toString("hex")}`;
  const secret = crypto.randomBytes(32).toString("hex");
  const key = { name: String(name || "terminal-key").slice(0, 80), id, secret, status: "active", created: now(), lastUsed: null };
  keys.set(id, key);
  return { ...publicKey(key), secret };
}
export function findKey(id) { return keys.get(id); }
export function disableKey(id) { const key = keys.get(id); if (!key) return null; key.status = "disabled"; return publicKey(key); }

export function addRequest(entry) {
  requests.unshift({ ...entry, receivedAt: now() });
  if (requests.length > 500) requests.pop();
}
export function addSecurityEvent(entry) {
  securityEvents.unshift({ ...entry, time: now() });
  if (securityEvents.length > 200) securityEvents.pop();
}
export function upsertDevice(id, patch = {}) {
  const existing = devices.get(id) || { id, name: `محطة ${id}`, type: "Terminal", region: "غير محدد", version: "unknown" };
  const updated = { ...existing, ...patch, id, lastSeen: now() };
  devices.set(id, updated);
  return updated;
}
export function listDevices() { return [...devices.values()].sort((a, b) => a.id.localeCompare(b.id)); }
export function listRequests() { return requests.slice(0, 100); }
export function listSecurityEvents() { return securityEvents.slice(0, 100); }
export function overview() {
  const all = listDevices();
  const verified = requests.filter((item) => item.status === "verified").length;
  const rejected = requests.filter((item) => item.status !== "verified").length;
  return {
    devices: { total: all.length, online: all.filter((d) => d.status === "online").length, warning: all.filter((d) => d.status === "warning").length, offline: all.filter((d) => d.status === "offline").length },
    requests: { total: requests.length, verified, rejected },
    security: { open: securityEvents.filter((event) => event.level === "high" || event.level === "medium").length },
    generatedAt: now(),
  };
}
