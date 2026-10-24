import { Link } from "react-router-dom";
import { contacts } from "../data/contacts";
import { ctaCopy } from "../data/site";
import { ScrollReveal } from "./ScrollReveal";

export function CtaBand({
  showFaqLink = true,
}: {
  showFaqLink?: boolean;
}) {
  return (
    <section className="cta-band flow-panel flow-cta" id="contacts" aria-labelledby="cta-title">
      <div className="container">
        <ScrollReveal className="cta-inner" stagger={100}>
          <div className="cta-copy">
            <h2 id="cta-title">{ctaCopy.title}</h2>
            <p>{ctaCopy.text}</p>
          </div>
          <div className="cta-actions">
            <a
              className="button button-accent"
              href={contacts.telegram}
              target="_blank"
              rel="noopener noreferrer"
            >
              {ctaCopy.telegram}
              <span className="visually-hidden">, откроется в новой вкладке</span>
            </a>
            <a
              className="cta-secondary"
              href={contacts.vk}
              target="_blank"
              rel="noopener noreferrer"
            >
              {ctaCopy.vk}
              <span className="visually-hidden">, откроется в новой вкладке</span>
            </a>
            {showFaqLink ? (
              <Link className="cta-secondary" to="/faq">
                Вопросы
              </Link>
            ) : null}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
