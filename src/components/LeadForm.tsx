import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ctaCopy } from "../data/site";
import { isApiConfigured } from "../lib/api";
import { notifyAdmin } from "../lib/notify";

/** Keep false until RU backend is live and the form is intentionally re-enabled. */
export const LEAD_FORM_ENABLED: boolean = false;

const CONTACT_METHODS = ["Telegram", "ВКонтакте", "MAX"] as const;
const SERVICES = [
  "Создание сайтов",
  "Приложения и цифровые сервисы",
  "AI-изображения для бизнеса",
  "Рекламные и AI-ролики",
  "Контент для социальных сетей",
  "Поддержка и развитие сайтов",
  "Другая задача",
] as const;

type Status = "idle" | "sending" | "done";

export function LeadForm() {
  const [name, setName] = useState("");
  const [contactMethod, setContactMethod] = useState<(typeof CONTACT_METHODS)[number]>("Telegram");
  const [contactHandle, setContactHandle] = useState("");
  const [service, setService] = useState<(typeof SERVICES)[number]>(SERVICES[0]);
  const [task, setTask] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const canSubmit = consent && status !== "sending";

  if (!LEAD_FORM_ENABLED) return null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!LEAD_FORM_ENABLED) return;
    if (!consent) {
      setError("Отметьте согласие на обработку персональных данных.");
      return;
    }
    if (!isApiConfigured()) {
      setError("Сейчас заявки принимаю в мессенджерах ниже — форма на сервере ещё не подключена.");
      return;
    }

    setStatus("sending");
    const ok = await notifyAdmin({
      name: name.trim(),
      contact: `${contactMethod}: ${contactHandle.trim()}`,
      contactMethod,
      contactHandle: contactHandle.trim(),
      service,
      task: task.trim(),
      consent: true,
      website,
    });

    if (!ok) {
      setStatus("idle");
      setError("Не удалось отправить. Напишите, пожалуйста, в мессенджер ниже.");
      return;
    }

    setStatus("done");
    setName("");
    setContactHandle("");
    setTask("");
    setConsent(false);
    setWebsite("");
  }

  if (status === "done") {
    return (
      <div className="cta-card cta-receipt" role="status">
        <p className="cta-channels-label">Заявка отправлена</p>
        <p className="cta-sent-note">{ctaCopy.success}</p>
      </div>
    );
  }

  return (
    <form className="cta-card cta-form" onSubmit={onSubmit} noValidate>
      <div className="cta-fields-row">
        <label className="cta-field">
          <span className="cta-field-label">{ctaCopy.fields.name.label}</span>
          <span className="cta-input-wrap">
            <span className="cta-input-icon" aria-hidden="true">
              ✎
            </span>
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              placeholder={ctaCopy.fields.name.placeholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </span>
        </label>

        <label className="cta-field">
          <span className="cta-field-label">{ctaCopy.fields.contactMethod.label}</span>
          <span className="cta-input-wrap">
            <span className="cta-input-icon" aria-hidden="true">
              ✈
            </span>
            <select
              name="contactMethod"
              required
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value as (typeof CONTACT_METHODS)[number])}
            >
              {CONTACT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </span>
        </label>
      </div>

      <label className="cta-field">
        <span className="cta-field-label">{ctaCopy.fields.contactHandle.label}</span>
        <span className="cta-input-wrap">
          <span className="cta-input-icon" aria-hidden="true">
            @
          </span>
          <input
            name="contactHandle"
            autoComplete="username"
            required
            minLength={2}
            maxLength={200}
            placeholder={ctaCopy.fields.contactHandle.placeholder}
            value={contactHandle}
            onChange={(e) => setContactHandle(e.target.value)}
          />
        </span>
      </label>

      <label className="cta-field">
        <span className="cta-field-label">{ctaCopy.fields.service.label}</span>
        <span className="cta-input-wrap">
          <span className="cta-input-icon" aria-hidden="true">
            ◆
          </span>
          <select
            name="service"
            required
            value={service}
            onChange={(e) => setService(e.target.value as (typeof SERVICES)[number])}
          >
            {SERVICES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </span>
      </label>

      <label className="cta-field">
        <span className="cta-field-label">{ctaCopy.fields.task.label}</span>
        <span className="cta-input-wrap cta-input-wrap--area">
          <span className="cta-input-icon" aria-hidden="true">
            ▤
          </span>
          <textarea
            name="task"
            required
            minLength={5}
            maxLength={4000}
            placeholder={ctaCopy.fields.task.placeholder}
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
        </span>
      </label>

      {/* Honeypot — bots fill this; humans never see it */}
      <div className="cta-honeypot" aria-hidden="true" hidden>
        <label>
          Сайт
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <label className="cta-agree">
        <input
          type="checkbox"
          name="consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          Согласен(на) на{" "}
          <Link to="/consent" target="_blank" rel="noreferrer">
            обработку персональных данных
          </Link>
        </span>
      </label>

      {error ? <p className="cta-form-error">{error}</p> : null}

      <button className="cta-submit" type="submit" disabled={!canSubmit}>
        <span>{status === "sending" ? "Отправка…" : ctaCopy.submit}</span>
        <span className="cta-submit-arrow" aria-hidden="true">
          →
        </span>
      </button>
    </form>
  );
}
