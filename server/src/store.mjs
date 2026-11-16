import { mkdirSync, readFileSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { join } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { serverRoot } from "./load-env.mjs";
import { APPLICATION_STATUSES } from "./application-status.mjs";

const dataDir = process.env.DATA_DIR || join(serverRoot, "data");
const appsPath = join(dataDir, "applications.json");

function ensure() {
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  if (!existsSync(appsPath)) {
    writeFileSync(appsPath, JSON.stringify({ nextNumber: 1, items: [] }, null, 2), "utf8");
  }
}

function readDb() {
  ensure();
  const raw = JSON.parse(readFileSync(appsPath, "utf8"));
  return {
    nextNumber: Number(raw.nextNumber) || 1,
    items: Array.isArray(raw.items) ? raw.items : [],
  };
}

function writeDb(db) {
  ensure();
  const temporary = `${appsPath}.tmp`;
  writeFileSync(temporary, JSON.stringify(db, null, 2), { encoding: "utf8", mode: 0o600 });
  renameSync(temporary, appsPath);
}

export function listApplications() {
  return readDb().items.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function createApplication(input) {
  const db = readDb();
  // Archive the exact source containing the legal documents, without client IP or user agent.
  const document = readFileSync(join(serverRoot, "..", "src", "data", "legal.ts"), "utf8");
  const documentHash = createHash("sha256").update(document).digest("hex");
  const documentsDir = join(dataDir, "consent-documents");
  mkdirSync(documentsDir, { recursive: true, mode: 0o700 });
  const documentPath = join(documentsDir, `${documentHash}.txt`);
  if (!existsSync(documentPath)) writeFileSync(documentPath, document, { encoding: "utf8", mode: 0o600 });
  const number = db.nextNumber;
  const item = {
    id: randomUUID(),
    number,
    name: input.name,
    contact: input.contact,
    contactMethod: input.contactMethod,
    contactHandle: input.contactHandle,
    service: input.service,
    task: input.task,
    createdAt: new Date().toISOString(),
    status: "new",
    consent: {
      accepted: true,
      acceptedAt: new Date().toISOString(),
      version: input.consentVersion,
      documentHash,
      documentPath: "/consent",
      method: "website-checkbox",
    },
  };
  db.nextNumber = number + 1;
  db.items.push(item);
  writeDb(db);
  return item;
}

export function updateApplication(id, patch) {
  const db = readDb();
  const index = db.items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  if (APPLICATION_STATUSES.has(patch.status)) {
    db.items[index] = { ...db.items[index], status: patch.status, updatedAt: new Date().toISOString() };
  }
  writeDb(db);
  return db.items[index];
}

export function deleteApplication(id) {
  const db = readDb();
  const before = db.items.length;
  db.items = db.items.filter((item) => item.id !== id);
  if (db.items.length === before) return false;
  writeDb(db);
  return true;
}
