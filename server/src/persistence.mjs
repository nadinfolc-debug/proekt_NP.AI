import "./load-env.mjs";

const driver = process.env.APPLICATION_STORAGE || "file";
if (driver !== "file" && driver !== "s3") throw new Error("Unknown application storage driver");
if (process.env.NODE_ENV === "production" && driver === "file" && !process.env.DATA_DIR) {
  throw new Error("Production requires persistent application storage. Configure private S3 or a persistent DATA_DIR.");
}
const store = driver === "s3"
  ? (await import("./s3-store.mjs")).configuredS3Store()
  : await import("./store.mjs");

export const createApplication = (...args) => store.createApplication(...args);
export const listApplications = (...args) => store.listApplications(...args);
export const updateApplication = (...args) => store.updateApplication(...args);
export const deleteApplication = (...args) => store.deleteApplication(...args);
