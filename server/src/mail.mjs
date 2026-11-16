/**
 * Email to the operator about a stored application.
 * Sent only from this RU server. Not a form endpoint and not Telegram.
 */
import nodemailer from "nodemailer";

export async function notifyMail(item) {
  const host = String(process.env.SMTP_HOST || "").trim();
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();
  const to = String(process.env.NOTIFY_EMAIL || "").trim();
  const from = String(process.env.SMTP_FROM || user).trim();
  const port = Number(process.env.SMTP_PORT || 465);

  if (!host || !user || !pass || !to) {
    return { ok: false, skipped: true, reason: "SMTP_HOST, SMTP_USER, SMTP_PASS or NOTIFY_EMAIL is not set" };
  }

  const when = new Date(item.createdAt);
  const dateTime = Number.isNaN(when.getTime())
    ? String(item.createdAt)
    : when.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });

  const text = [
    `Новая заявка №${item.number}`,
    `Дата и время (МСК): ${dateTime}`,
    `Имя: ${item.name}`,
    `Куда ответить: ${item.contactMethod || ""}`,
    `Контакт: ${item.contactHandle || item.contact || ""}`,
    `Услуга: ${item.service || ""}`,
    "Задача:",
    item.task || "",
    "",
    "Заявка сохранена на сервере. Список заявок — в кабинете сайта /admin.",
  ].join("\n");

  try {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transport.sendMail({
      from,
      to,
      subject: `Заявка №${item.number} — NP.AI`,
      text,
    });
    return { ok: true, skipped: false };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      error: error instanceof Error ? error.message : "mail failed",
    };
  }
}
