import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { contacts } from "../data/contacts";
import { ctaCopy } from "../data/site";
import { addApplication } from "../lib/store";
import { ScrollReveal } from "./ScrollReveal";

export function CtaBand({
  showFaqLink: _showFaqLink = true,
}: {
  showFaqLink?: boolean;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [task, setTask] = useState("");
  const [agree, setAgree] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agree) return;

    addApplication({
      name: name.trim(),
      contact: contact.trim(),
      task: task.trim(),
    });

    const message = [
      "Здравствуйте! Хочу обсудить проект.",
      "",
      `Имя: ${name.trim()}`,
      `Для связи: ${contact.trim()}`,
      "",
      "Задача:",
      task.trim(),
    ].join("\n");

    const url = `${contacts.telegram}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    setName("");
    setContact("");
    setTask("");
    setAgree(false);
    setSent(true);
  };

  return (
    <section className="cta-band flow-panel flow-cta" id="contacts" aria-labelledby="cta-title">
      <div className="container">
        <ScrollReveal className="cta-inner" stagger={100}>
          <div className="cta-copy">
            <h2 id="cta-title">{ctaCopy.title}</h2>
            <p>{ctaCopy.text}</p>
          </div>

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
              />
            </label>

            <label className="cta-agree">
              <input
                type="checkbox"
                checked={agree}
                onChange={(event) => setAgree(event.target.checked)}
                required
              />
              <span>
                Согласен с{" "}
                <Link to="/privacy">политикой конфиденциальности</Link> и{" "}
                <Link to="/offer">офертой</Link>
              </span>
            </label>

            <button className="button button-accent" type="submit">
              {ctaCopy.submit}
            </button>
            {sent ? <p className="cta-sent">Заявка сохранена. Можно продолжить в мессенджере.</p> : null}
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
