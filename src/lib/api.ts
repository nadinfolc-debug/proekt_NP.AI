export type Application = {
  id: string;
  number: number;
  name: string;
  contact: string;
  contactMethod?: string;
  contactHandle?: string;
  service?: string;
  task: string;
  createdAt: string;
  status: "new" | "done";
};

export type ApplicationPayload = {
  name: string;
  contactMethod: string;
  contactHandle: string;
  service: string;
  task: string;
  consent: boolean;
  website?: string;
};

const TOKEN_KEY = "npai.admin.token";

function apiBase() {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "";
}

export function isApiConfigured() {
  return Boolean(apiBase());
}

export function getAdminToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setAdminToken(token: string | null) {
  try {
    if (!token) sessionStorage.removeItem(TOKEN_KEY);
    else sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const base = apiBase();
  if (!base) {
    return { ok: false, status: 0, data: null, error: "API URL is not configured" };
  }

  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth) {
    const token = getAdminToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${base}${path}`, { ...options, headers });
    const data = (await response.json().catch(() => null)) as T & { error?: string; ok?: boolean } | null;
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data,
        error: data && typeof data === "object" && "error" in data ? String(data.error) : `HTTP ${response.status}`,
      };
    }
    return { ok: true, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: null, error: "Network error" };
  }
}

export async function submitApplication(payload: ApplicationPayload) {
  const result = await request<{ ok?: boolean; number?: number; error?: string }>("/api/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result;
}

export async function loginAdmin(login: string, password: string) {
  const result = await request<{ ok?: boolean; token?: string; error?: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ login, password }),
  });
  if (result.ok && result.data?.token) {
    setAdminToken(result.data.token);
    return true;
  }
  setAdminToken(null);
  return false;
}

export async function logoutAdmin() {
  await request("/api/auth/logout", { method: "POST", auth: true });
  setAdminToken(null);
}

export async function checkAdminSession() {
  const token = getAdminToken();
  if (!token) return false;
  const result = await request<{ ok?: boolean }>("/api/auth/me", { method: "GET", auth: true });
  if (!result.ok) {
    setAdminToken(null);
    return false;
  }
  return true;
}

export async function fetchApplications() {
  const result = await request<{ ok?: boolean; items?: Application[] }>("/api/applications", {
    method: "GET",
    auth: true,
  });
  if (!result.ok || !result.data?.items) return [];
  return result.data.items;
}

export async function patchApplication(id: string, status: "new" | "done") {
  return request(`/api/applications/${encodeURIComponent(id)}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ status }),
  });
}

export async function removeApplication(id: string) {
  return request(`/api/applications/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  });
}
