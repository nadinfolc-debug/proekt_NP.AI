/**
 * Sends a short notice to VK peers: application number + date/time only.
 * Never includes name, contact, service, or task text.
 */
export async function notifyVkShort({ number, createdAt }) {
  const token = String(process.env.VK_ACCESS_TOKEN || "").trim();
  const peers = String(process.env.VK_NOTIFY_PEER_IDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const version = String(process.env.VK_API_VERSION || "5.199");

  if (!token || peers.length === 0) {
    return { ok: false, skipped: true, reason: "VK_ACCESS_TOKEN or VK_NOTIFY_PEER_IDS not set" };
  }

  const when = new Date(createdAt);
  const dateTime = Number.isNaN(when.getTime())
    ? String(createdAt)
    : when.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });

  const message = `Новая заявка на сайте NP.AI\nНомер: №${number}\nДата и время: ${dateTime}`;

  const results = [];
  for (const peerId of peers) {
    const body = new URLSearchParams({
      access_token: token,
      v: version,
      peer_id: peerId,
      random_id: String(Date.now() + Math.floor(Math.random() * 1000)),
      message,
    });

    try {
      const response = await fetch("https://api.vk.ru/method/messages.send", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = await response.json().catch(() => ({}));
      if (data.error) {
        results.push({ peerId, ok: false, error: data.error.error_msg || "VK error" });
      } else {
        results.push({ peerId, ok: true });
      }
    } catch (error) {
      results.push({ peerId, ok: false, error: error instanceof Error ? error.message : "fetch failed" });
    }
  }

  const ok = results.some((item) => item.ok);
  return { ok, skipped: false, results };
}
