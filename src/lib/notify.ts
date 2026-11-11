import { isApiConfigured, submitApplication } from "./api";

export type NotifyPayload = {
  name: string;
  contact: string;
  contactMethod: string;
  contactHandle: string;
  service: string;
  task: string;
  consent: boolean;
  website?: string;
};

export function isNotifyConfigured() {
  return isApiConfigured();
}

/** Submits application to RU backend. Retries once. Never throws. */
export async function notifyAdmin(payload: NotifyPayload): Promise<boolean> {
  if (!isNotifyConfigured()) return false;

  const body = {
    name: payload.name,
    contactMethod: payload.contactMethod,
    contactHandle: payload.contactHandle,
    service: payload.service,
    task: payload.task,
    consent: payload.consent,
    website: payload.website || "",
  };

  try {
    if ((await submitApplication(body)).ok) return true;
  } catch {
    // retry below
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return (await submitApplication(body)).ok;
  } catch {
    return false;
  }
}
