import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { serverRoot } from "./load-env.mjs";

const dataDir = join(serverRoot, "data");
const appsPath = join(dataDir, "applications.json");

function ensure() {
  mkdirSync(dataDir, { recursive: true });
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
  writeFileSync(appsPath, JSON.stringify(db, null, 2), "utf8");
}

export function listApplications() {
  return readDb().items.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function createApplication(input) {
  const db = readDb();
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
  if (patch.status === "new" || patch.status === "done") {
    db.items[index] = { ...db.items[index], status: patch.status };
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
