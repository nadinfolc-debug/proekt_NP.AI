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

/** Sends application to Telegram notify worker. Never throws. */
export async function notifyAdmin(payload: NotifyPayload): Promise<boolean> {
  if (!isNotifyConfigured() || !notifyUrl) return false;

  try {
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
  } catch {
    return false;
  }
}
