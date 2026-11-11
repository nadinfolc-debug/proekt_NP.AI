const CONTACT_METHODS = new Set(["Telegram", "ВКонтакте", "MAX"]);
const SERVICES = new Set([
  "Создание сайтов",
  "Приложения и цифровые сервисы",
  "AI-изображения для бизнеса",
  "Рекламные и AI-ролики",
  "Контент для социальных сетей",
  "Поддержка и развитие сайтов",
  "Другая задача",
]);

export function validateApplication(body) {
  if (!body || typeof body !== "object") return { error: "Invalid JSON" };

  // Honeypot: bots fill hidden field
  if (String(body.website || body.company || "").trim()) {
    return { honeypot: true };
  }

  const name = String(body.name || "").trim();
  const contactMethod = String(body.contactMethod || "").trim();
  const contactHandle = String(body.contactHandle || "").trim();
  const service = String(body.service || "").trim();
  const task = String(body.task || "").trim();
  const consent = body.consent === true || body.consent === "true" || body.agree === true;

  if (!consent) return { error: "Consent required" };
  if (name.length < 2 || name.length > 100) return { error: "Invalid name" };
  if (!CONTACT_METHODS.has(contactMethod)) return { error: "Invalid contact method" };
  if (contactHandle.length < 2 || contactHandle.length > 200) return { error: "Invalid contact" };
  if (!SERVICES.has(service)) return { error: "Invalid service" };
  if (task.length < 5 || task.length > 4000) return { error: "Invalid task" };

  return {
    value: {
      name,
      contactMethod,
      contactHandle,
      contact: `${contactMethod}: ${contactHandle}`,
      service,
      task,
    },
  };
}
