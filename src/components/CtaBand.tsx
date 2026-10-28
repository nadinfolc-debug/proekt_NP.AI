import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ctaCopy } from "../data/site";
import { notifyAdmin } from "../lib/notify";
import { addApplication } from "../lib/store";
import { useSectionId } from "../lib/useSectionId";
import { ScrollReveal } from "./ScrollReveal";
import { SectionBackdrop } from "./SectionBackdrop";

type SubmitStatus = "idle" | "sending" | "done";

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

  return (
    <section className="cta-band flow-panel flow-cta" id={sectionId} aria-labelledby="cta-title">
      <SectionBackdrop />
      <div className="container">
        <ScrollReveal className="cta-inner" stagger={120} delay={40}>
          <div className="cta-copy">
            <h2 id="cta-title">{ctaCopy.title}</h2>
            {ctaCopy.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {status === "done" ? (
            <div className="cta-receipt" role="status">
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
            <form className="cta-form" onSubmit={onSubmit}>
              <label className="cta-field">
                <span className="cta-field-label">{ctaCopy.fields.name.label}</span>
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
              </label>

              <label className="cta-field">
                <span className="cta-field-label">{ctaCopy.fields.contact.label}</span>
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
              </label>

              <label className="cta-field">
                <span className="cta-field-label">{ctaCopy.fields.task.label}</span>
                <textarea
                  name="task"
                  rows={5}
                  required
                  placeholder={ctaCopy.fields.task.placeholder}
                  value={task}
                  onChange={(event) => setTask(event.target.value)}
                  disabled={status === "sending"}
                />
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

              <button className="button button-accent" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Отправка…" : ctaCopy.submit}
              </button>
            </form>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
