import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ctaCopy } from "../data/site";
import { notifyAdmin } from "../lib/notify";
import { addApplication } from "../lib/store";
import { useSectionId } from "../lib/useSectionId";
import { ScrollReveal } from "./ScrollReveal";
import { SectionBackdrop } from "./SectionBackdrop";

type SubmitStatus = "idle" | "sending" | "done";

function CtaDecor() {
  return (
    <div className="cta-decor" aria-hidden="true">
      <svg className="cta-sprig cta-sprig--bl" viewBox="0 0 120 280" fill="none">
        <path
          d="M58 268C56 210 62 150 58 92C56 62 52 36 48 12"
          stroke="#6E66B8"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.45"
        />
        <g fill="#C9C2FF" opacity="0.9">
          <ellipse cx="48" cy="28" rx="5" ry="8.5" transform="rotate(-18 48 28)" />
          <ellipse cx="56" cy="22" rx="5" ry="9" transform="rotate(-6 56 22)" />
          <ellipse cx="64" cy="28" rx="5" ry="8.5" transform="rotate(14 64 28)" />
          <ellipse cx="52" cy="42" rx="4.5" ry="8" transform="rotate(-12 52 42)" />
          <ellipse cx="60" cy="40" rx="4.5" ry="8" transform="rotate(8 60 40)" />
          <ellipse cx="54" cy="56" rx="4.2" ry="7.4" transform="rotate(-8 54 56)" />
        </g>
      </svg>
      <svg className="cta-sprig cta-sprig--tr" viewBox="0 0 120 280" fill="none">
        <path
          d="M58 268C56 210 62 150 58 92C56 62 52 36 48 12"
          stroke="#6E66B8"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />
        <g fill="#C9C2FF" opacity="0.85">
          <ellipse cx="48" cy="28" rx="5" ry="8.5" transform="rotate(-18 48 28)" />
          <ellipse cx="56" cy="22" rx="5" ry="9" transform="rotate(-6 56 22)" />
          <ellipse cx="64" cy="28" rx="5" ry="8.5" transform="rotate(14 64 28)" />
          <ellipse cx="52" cy="42" rx="4.5" ry="8" transform="rotate(-12 52 42)" />
          <ellipse cx="60" cy="40" rx="4.5" ry="8" transform="rotate(8 60 40)" />
        </g>
      </svg>
    </div>
  );
}

export function CtaBand({
  showFaqLink: _showFaqLink = true,
}: {
  showFaqLink?: boolean;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [task, setTask] = useState("");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [receipt, setReceipt] = useState<{ name: string; contact: string; task: string } | null>(
    null,
  );
  const sectionId = useSectionId("discuss");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agree || status === "sending") return;

    const payload = {
      name: name.trim(),
      contact: contact.trim(),
      task: task.trim(),
    };

    setStatus("sending");
    setReceipt(null);

    addApplication(payload);
    await notifyAdmin(payload);

    setReceipt(payload);
    setName("");
    setContact("");
    setTask("");
    setAgree(false);
    setStatus("done");
  };

  const resetForm = () => {
    setStatus("idle");
    setReceipt(null);
  };

  const [titleMain, titleAccent = ""] = ctaCopy.title.split(" ");

  return (
    <section className="cta-band flow-panel flow-cta" id={sectionId} aria-labelledby="cta-title">
      <SectionBackdrop />
      <CtaDecor />
      <div className="container">
        <ScrollReveal className="cta-inner" stagger={120} delay={40}>
          <div className="cta-copy">
            <p className="cta-eyebrow">Контакты</p>
            <h2 id="cta-title" className="cta-title">
              <span className="cta-title-main">{titleMain}</span>{" "}
              <span className="cta-title-accent">{titleAccent}</span>
            </h2>
            <p className="cta-lead">{ctaCopy.paragraphs[0]}</p>
            <p className="cta-note">
              <span className="cta-note-icon" aria-hidden="true">
                ✈
              </span>
              <span>{ctaCopy.paragraphs[1]}</span>
            </p>
          </div>

          {status === "done" ? (
            <div className="cta-card cta-receipt" role="status">
              <p className="cta-sent">Заявка отправлена. Я свяжусь с вами.</p>
              {receipt ? (
                <dl className="cta-receipt-list">
                  <div>
                    <dt>Имя</dt>
                    <dd>{receipt.name}</dd>
                  </div>
                  <div>
                    <dt>Связь</dt>
                    <dd>{receipt.contact}</dd>
                  </div>
                  <div>
                    <dt>Задача</dt>
                    <dd>{receipt.task}</dd>
                  </div>
                </dl>
              ) : null}
              <button className="button button-ghost" type="button" onClick={resetForm}>
                Отправить ещё одну
              </button>
            </div>
          ) : (
            <form className="cta-card cta-form" onSubmit={onSubmit}>
              <div className="cta-fields-row">
                <label className="cta-field">
                  <span className="cta-field-label">{ctaCopy.fields.name.label}</span>
                  <span className="cta-input-wrap">
                    <span className="cta-input-icon" aria-hidden="true">
                      👤
                    </span>
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      required
                      placeholder={ctaCopy.fields.name.placeholder}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      disabled={status === "sending"}
                    />
                  </span>
                </label>

                <label className="cta-field">
                  <span className="cta-field-label">{ctaCopy.fields.contact.label}</span>
                  <span className="cta-input-wrap">
                    <span className="cta-input-icon" aria-hidden="true">
                      ✉
                    </span>
                    <input
                      type="text"
                      name="contact"
                      autoComplete="username"
                      required
                      placeholder={ctaCopy.fields.contact.placeholder}
                      value={contact}
                      onChange={(event) => setContact(event.target.value)}
                      disabled={status === "sending"}
                    />
                  </span>
                </label>
              </div>

              <label className="cta-field">
                <span className="cta-field-label">{ctaCopy.fields.task.label}</span>
                <span className="cta-input-wrap cta-input-wrap--area">
                  <span className="cta-input-icon" aria-hidden="true">
                    ✎
                  </span>
                  <textarea
                    name="task"
                    rows={5}
                    required
                    placeholder={ctaCopy.fields.task.placeholder}
                    value={task}
                    onChange={(event) => setTask(event.target.value)}
                    disabled={status === "sending"}
                  />
                </span>
              </label>

              <label className="cta-agree">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(event) => setAgree(event.target.checked)}
                  required
                  disabled={status === "sending"}
                />
                <span>
                  Согласен с{" "}
                  <Link to="/privacy">политикой конфиденциальности</Link> и{" "}
                  <Link to="/offer">офертой</Link>
                </span>
              </label>

              <button className="cta-submit" type="submit" disabled={status === "sending"}>
                <span>{status === "sending" ? "Отправка…" : ctaCopy.submit}</span>
                <span className="cta-submit-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </form>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
