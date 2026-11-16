import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createS3Store } from "./s3-store.mjs";

test("private applications survive a new store instance, retries and pagination", async () => {
  const objects = new Map();
  const commands = [];
  const client = { async send(command) {
    const input = command.input;
    commands.push(command);
    switch (command.constructor.name) {
      case "GetObjectCommand": {
        if (!objects.has(input.Key)) throw Object.assign(new Error("Missing"), { name: "NoSuchKey" });
        return { ETag: createHash("sha256").update(objects.get(input.Key)).digest("hex"),
          Body: { transformToString: async () => objects.get(input.Key) } };
      }
      case "PutObjectCommand": {
        if (input.IfMatch && (!objects.has(input.Key) || input.IfMatch !== createHash("sha256").update(objects.get(input.Key)).digest("hex"))) throw Object.assign(new Error("Modified or deleted"), { $metadata: { httpStatusCode: 412 } });
        assert.equal(input.ACL, "private");
        assert.equal(input.CacheControl, "no-store");
        if (input.IfNoneMatch && objects.has(input.Key)) throw Object.assign(new Error("Exists"), { $metadata: { httpStatusCode: 412 } });
        objects.set(input.Key, input.Body);
        return {};
      }
      case "ListObjectsV2Command": {
        const keys = [...objects.keys()].filter((key) => key.startsWith(input.Prefix)).sort();
        const index = Number(input.ContinuationToken || 0);
        return { Contents: keys.slice(index, index + 1).map((Key) => ({ Key })),
          IsTruncated: index + 1 < keys.length, NextContinuationToken: String(index + 1) };
      }
      case "DeleteObjectCommand": objects.delete(input.Key); return {};
      default: throw new Error("Unexpected command");
    }
  } };
  const store = createS3Store(client, "test-bucket");
  const payload = { requestId: "11111111-1111-4111-8111-111111111111", name: "Тест",
    contact: "MAX: test", contactMethod: "MAX", contactHandle: "test", service: "Создание сайтов",
    task: "Тестовая задача", consentVersion: "2026-11-16" };
  const first = await store.createApplication(payload);
  const retry = await store.createApplication(payload);
  assert.equal(first.id, retry.id);
  await store.createApplication({ ...payload, requestId: "22222222-2222-4222-8222-222222222222" });
  const restarted = createS3Store(client, "test-bucket");
  assert.equal((await restarted.listApplications()).length, 2);
  const document = objects.get(`consent-documents/${first.consent.documentHash}.txt`);
  assert.equal(createHash("sha256").update(document).digest("hex"), first.consent.documentHash);
  assert.equal(first.consent.accepted, true);
  const updated = await restarted.updateApplication(first.id, { status: "done", name: "tampered" });
  assert.equal(updated.status, "done");
  assert.equal(updated.name, "Тест");
  assert.equal(await restarted.deleteApplication(first.id), true);
  assert.equal((await restarted.listApplications()).length, 1);
  const previousCount = commands.length;
  assert.equal(await restarted.deleteApplication("../secret"), false);
  assert.equal(commands.length, previousCount);
});

test("storage failure never becomes an empty successful inbox", async () => {
  const store = createS3Store({ send: async () => { throw new Error("Storage unavailable"); } }, "test-bucket");
  await assert.rejects(store.listApplications(), /Storage unavailable/);
  await assert.rejects(store.createApplication({}), /Storage unavailable/);
});
