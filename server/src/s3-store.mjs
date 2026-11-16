import { randomUUID, createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { serverRoot } from "./load-env.mjs";

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const ETAG = Symbol("etag");
const missing = (error) => error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404;

export function createS3Store(client, bucket) {
  const keyFor = (id) => UUID.test(id) ? `applications/${id}.json` : null;
  async function get(id) {
    const Key = keyFor(id);
    if (!Key) return null;
    try {
      const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key }));
      const item = JSON.parse(await result.Body.transformToString());
      Object.defineProperty(item, ETAG, { value: result.ETag });
      return item;
    } catch (error) {
      if (missing(error)) return null;
      throw error;
    }
  }
  async function put(Key, value, extra = {}) {
    await client.send(new PutObjectCommand({ Bucket: bucket, Key,
      Body: typeof value === "string" ? value : JSON.stringify(value),
      ContentType: typeof value === "string" ? "text/plain; charset=utf-8" : "application/json",
      ACL: "private", CacheControl: "no-store", ...extra,
    }));
  }
  return {
    async createApplication(input) {
      const id = input.requestId || randomUUID();
      const Key = keyFor(id);
      if (!Key) throw new Error("Invalid application ID");
      const existing = await get(id);
      if (existing) return existing;
      const document = readFileSync(join(serverRoot, "..", "src", "data", "legal.ts"), "utf8");
      const documentHash = createHash("sha256").update(document).digest("hex");
      await put(`consent-documents/${documentHash}.txt`, document);
      const now = new Date().toISOString();
      const item = {
        id, number: `${now.slice(0, 10).replaceAll("-", "")}-${id.slice(0, 8).toUpperCase()}`,
        name: input.name, contact: input.contact, contactMethod: input.contactMethod,
        contactHandle: input.contactHandle, service: input.service, task: input.task,
        createdAt: now, status: "new",
        consent: { accepted: true, acceptedAt: now, version: input.consentVersion,
          documentHash, documentPath: "/consent", method: "website-checkbox" },
      };
      try {
        await put(Key, item, { IfNoneMatch: "*" });
      } catch (error) {
        if (error.$metadata?.httpStatusCode !== 412) throw error;
        const saved = await get(id);
        if (!saved) throw error;
        return saved;
      }
      return item;
    },
    async listApplications() {
      const items = [];
      let ContinuationToken;
      do {
        const page = await client.send(new ListObjectsV2Command({ Bucket: bucket,
          Prefix: "applications/", ContinuationToken }));
        for (const object of page.Contents || []) {
          const id = object.Key?.slice("applications/".length).replace(/\.json$/, "");
          if (id && UUID.test(id)) {
            const item = await get(id);
            if (item) items.push(item);
          }
        }
        ContinuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
      } while (ContinuationToken);
      return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async updateApplication(id, patch) {
      const item = await get(id);
      if (!item) return null;
      if (patch.status !== "new" && patch.status !== "done") return item;
      const updated = { ...item, status: patch.status };
      if (!item[ETAG]) throw new Error("Storage returned no concurrency token");
      await put(keyFor(id), updated, { IfMatch: item[ETAG] });
      return updated;
    },
    async deleteApplication(id) {
      if (!await get(id)) return false;
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: keyFor(id) }));
      return true;
    },
  };
}

export function configuredS3Store() {
  const endpoint = new URL(process.env.S3_ENDPOINT || "https://s3.twcstorage.ru");
  if (endpoint.protocol !== "https:" || !/(^|\.)twcstorage\.ru$/.test(endpoint.hostname) || endpoint.username || endpoint.password) {
    throw new Error("Use the HTTPS endpoint of Russian Timeweb S3 storage");
  }
  for (const key of ["S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"]) {
    if (!process.env[key]) throw new Error(`Missing storage setting: ${key}`);
  }
  return createS3Store(new S3Client({
    endpoint: endpoint.href, region: process.env.S3_REGION || "ru-1", forcePathStyle: true,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY },
    maxAttempts: 3, requestChecksumCalculation: "WHEN_REQUIRED", responseChecksumValidation: "WHEN_REQUIRED",
  }), process.env.S3_BUCKET);
}
