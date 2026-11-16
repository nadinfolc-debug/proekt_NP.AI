import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import { notifyMail } from "./mail.mjs";

test("email contains no applicant data and requires TLS", async () => {
  const originalTransport = nodemailer.createTransport;
  const keys = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "NOTIFY_EMAIL"];
  const saved = keys.map((key) => process.env[key]);
  let sent;
  let config;
  try {
    for (const key of keys) process.env[key] = "test-only";
    nodemailer.createTransport = (options) => {
      config = options;
      return { sendMail: async (message) => { sent = message; } };
    };
    const result = await notifyMail({ number: 42, createdAt: "2026-11-16T10:00:00Z",
      name: "SECRET_NAME", contactHandle: "SECRET_CONTACT", task: "SECRET_TASK", service: "SECRET_SERVICE" });
    assert.equal(result.ok, true);
    assert.equal(config.requireTLS, true);
    assert.ok(sent.text.includes("42"));
    assert.ok(!JSON.stringify(sent).includes("SECRET_"));
  } finally {
    nodemailer.createTransport = originalTransport;
    keys.forEach((key, i) => { if (saved[i] === undefined) delete process.env[key]; else process.env[key] = saved[i]; });
  }
});

test("closed cabinet, consent evidence, logout, body limit and login throttling", async () => {
  const probe = createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  const dataDir = mkdtempSync(join(tmpdir(), "npai-security-test-"));
  const child = spawn(process.execPath, [fileURLToPath(new URL("./index.mjs", import.meta.url))], {
    env: { ...process.env, NODE_ENV: "test", APPLICATION_STORAGE: "file", HOST: "127.0.0.1", PORT: String(port), DATA_DIR: dataDir,
      ADMIN_LOGIN: "owner", ADMIN_PASSWORD: "test-password-only-12345", SMTP_PASS: "", RATE_LIMIT_MAX: "50" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const exited = once(child, "exit");
  try {
    await Promise.race([
      once(child.stdout, "data"),
      exited.then(() => { throw new Error("Test server exited"); }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Startup timeout")), 10000).unref()),
    ]);
    const request = (path, method = "GET", body, token) => fetch(`http://127.0.0.1:${port}${path}`, {
      method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    for (const path of ["/api/applications", "/api/auth/me"]) {
      for (const token of [undefined, "forged-token"]) {
        const response = await request(path, "GET", undefined, token);
        assert.equal(response.status, 401);
        assert.match(response.headers.get("cache-control"), /no-store/);
      }
    }
    for (const method of ["PATCH", "DELETE"]) {
      assert.equal((await request("/api/applications/fake", method, undefined)).status, 401);
    }
    const payload = { name: "Тест", contactMethod: "MAX", contactHandle: "test-only", service: "Создание сайтов", task: "Тестовая задача", consentVersion: "2026-11-16" };
    assert.equal((await request("/api/applications", "POST", payload)).status, 400);
    assert.equal((await request("/api/applications", "POST", { ...payload, consent: true, consentVersion: "old" })).status, 400);
    assert.equal((await request("/api/applications", "POST", { ...payload, consent: true })).status, 200);
    const db = JSON.parse(readFileSync(join(dataDir, "applications.json"), "utf8"));
    assert.equal(db.items.length, 1);
    assert.equal(db.items[0].consent.accepted, true);
    assert.equal(db.items[0].consent.version, "2026-11-16");
    assert.ok(readFileSync(join(dataDir, "consent-documents", `${db.items[0].consent.documentHash}.txt`), "utf8").includes("consentSections"));
    const login = await request("/api/auth/login", "POST", { login: "owner", password: "test-password-only-12345" });
    assert.equal(login.status, 200);
    const { token } = await login.json();
    assert.equal((await request("/api/applications", "GET", undefined, token)).status, 200);
    for (const status of ["in_progress", "review", "done", "delivered", "new"]) {
      const response = await request(`/api/applications/${db.items[0].id}`, "PATCH", { status }, token);
      assert.equal(response.status, 200);
      assert.equal((await response.json()).item.status, status);
    }
    assert.equal((await request(`/api/applications/${db.items[0].id}`, "PATCH", { status: "unknown" }, token)).status, 400);
    assert.equal((await request(`/api/applications/${db.items[0].id}`, "PATCH", { status: "delivered" })).status, 401);
    assert.equal((await request("/api/auth/logout", "POST", {}, token)).status, 200);
    assert.equal((await request("/api/applications", "GET", undefined, token)).status, 401);
    assert.equal((await request("/api/applications", "POST", { oversized: "x".repeat(40000) })).status, 413);
    for (let i = 0; i < 9; i++) {
      assert.equal((await request("/api/auth/login", "POST", { login: "owner", password: "wrong" })).status, 401);
    }
    const limited = await request("/api/auth/login", "POST", { login: "owner", password: "test-password-only-12345" });
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("retry-after"), "900");
  } finally {
    child.kill();
    await exited;
  }
});
