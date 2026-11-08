import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ctaCopy } from "../data/site";
import { isNotifyConfigured, notifyAdmin, type NotifyPayload } from "../lib/notify";
import { addApplication } from "../lib/store";
import { useSectionId } from "../lib/useSectionId";
import { ScrollReveal } from "./ScrollReveal";
import { SectionBackdrop } from "./SectionBackdrop";

type SubmitStatus = "idle" | "sending" | "done" | "error";

export function CtaBand({
  showFaqLink: _showFaqLink = true,
}: {
  showFaqLink?: boolean;
}) {
  const [name, setName] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [contactHandle, setContactHandle] = useState("");
  const [service, setService] = useState("");
  const [task, setTask] = useState("");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const sectionId = useSectionId("discuss");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agree || status === "sending") return;

    const payload: NotifyPayload = {
      name: name.trim(),
      contactMethod: contactMethod.trim(),
      contactHandle: contactHandle.trim(),
      contact: `${contactMethod.trim()}: ${contactHandle.trim()}`,
      service: service.trim(),
      task: task.trim(),
    };

    setStatus("sending");

    addApplication(payload);

    const delivered = isNotifyConfigured() ? await notifyAdmin(payload) : true;
    if (!delivered) {
      setStatus("error");
      return;
    }

    setName("");
    setContactMethod("");
    setContactHandle("");
    setService("");
    setTask("");
    setAgree(false);
    setStatus("done");
  };

  const resetForm = () => {
    setStatus("idle");
  };

  const [titleMain, titleAccent = ""] = ctaCopy.title.split(" ");

  return (
    <section className="cta-band flow-panel flow-cta" id={sectionId} aria-labelledby="cta-title">
      <SectionBackdrop />
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
              <p className="cta-sent">{ctaCopy.successTitle}</p>
              <p className="cta-sent-note">{ctaCopy.successText}</p>
              <button className="button button-ghost" type="button" onClick={resetForm}>
                Отправить ещё одну
              </button>
            </div>
          ) : (
            <form className="cta-card cta-form" onSubmit={onSubmit}>
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

              <div className="cta-fields-row">
                <label className="cta-field">
                  <span className="cta-field-label">{ctaCopy.fields.contactMethod.label}</span>
                  <span className="cta-input-wrap cta-input-wrap--select">
                    <span className="cta-input-icon" aria-hidden="true">
                      ✉
                    </span>
                    <select
                      name="contactMethod"
                      required
                      value={contactMethod}
                      onChange={(event) => setContactMethod(event.target.value)}
                      disabled={status === "sending"}
                    >
                      <option value="" disabled>
                        {ctaCopy.fields.contactMethod.placeholder}
                      </option>
                      {ctaCopy.contactMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>

                <label className="cta-field">
                  <span className="cta-field-label">{ctaCopy.fields.contactHandle.label}</span>
                  <span className="cta-input-wrap">
                    <span className="cta-input-icon" aria-hidden="true">
                      @
                    </span>
                    <input
                      type="text"
                      name="contactHandle"
                      autoComplete="username"
                      required
                      placeholder={ctaCopy.fields.contactHandle.placeholder}
                      value={contactHandle}
                      onChange={(event) => setContactHandle(event.target.value)}
                      disabled={status === "sending"}
                    />
                  </span>
                </label>
              </div>

              <label className="cta-field">
                <span className="cta-field-label">{ctaCopy.fields.service.label}</span>
                <span className="cta-input-wrap cta-input-wrap--select">
                  <span className="cta-input-icon" aria-hidden="true">
                    ◆
                  </span>
                  <select
                    name="service"
                    required
                    value={service}
                    onChange={(event) => setService(event.target.value)}
                    disabled={status === "sending"}
                  >
                    <option value="" disabled>
                      {ctaCopy.fields.service.placeholder}
                    </option>
                    {ctaCopy.services.map((item) => (
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

              {status === "error" ? (
                <p className="cta-form-error" role="alert">
                  {ctaCopy.errorText}
                </p>
              ) : null}

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
