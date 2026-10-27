export type NotifyPayload = {
  name: string;
  contact: string;
  task: string;
};

const notifyUrl = import.meta.env.VITE_NOTIFY_URL as string | undefined;
const notifySecret = import.meta.env.VITE_NOTIFY_SECRET as string | undefined;

export function isNotifyConfigured() {
  return Boolean(notifyUrl && notifyUrl.trim());
}

async function postOnce(payload: NotifyPayload): Promise<boolean> {
  if (!isNotifyConfigured() || !notifyUrl) return false;

  const response = await fetch(notifyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(notifySecret ? { "X-Notify-Secret": notifySecret } : {}),
    },
    body: JSON.stringify({
      name: payload.name,
      contact: payload.contact,
      task: payload.task,
      ...(notifySecret ? { secret: notifySecret } : {}),
    }),
  });

  if (!response.ok) return false;
  const data = (await response.json().catch(() => null)) as { ok?: boolean } | null;
  return Boolean(data?.ok);
}

/** Sends application to Telegram notify worker. Retries once. Never throws. */
export async function notifyAdmin(payload: NotifyPayload): Promise<boolean> {
  if (!isNotifyConfigured()) return false;

  try {
    if (await postOnce(payload)) return true;
  } catch {
    // retry below
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return await postOnce(payload);
  } catch {
    return false;
  }
}
