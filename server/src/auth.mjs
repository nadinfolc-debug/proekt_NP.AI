import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const sessions = new Map();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function hashPassword(password, salt) {
  return scryptSync(password, salt, 64);
}

export function verifyAdminCredentials(login, password) {
  const expectedLogin = String(process.env.ADMIN_LOGIN || "admin");
  const expectedPassword = String(process.env.ADMIN_PASSWORD || "");
  if (!expectedPassword) return false;
  if (login !== expectedLogin) return false;

  const salt = createHash("sha256").update(`npai-admin:${expectedLogin}`).digest();
  const a = hashPassword(password, salt);
  const b = hashPassword(expectedPassword, salt);
  return timingSafeEqual(a, b);
}

export function createSession() {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

export function revokeSession(token) {
  if (token) sessions.delete(token);
}

export function isSessionValid(token) {
  if (!token) return false;
  const expires = sessions.get(token);
  if (!expires) return false;
  if (Date.now() > expires) {
    sessions.delete(token);
    return false;
  }
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return true;
}

export function bearerToken(req) {
  const header = req.headers.authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : "";
}
