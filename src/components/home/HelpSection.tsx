import { ScrollReveal } from "../ScrollReveal";
import { helpBlocks, helpCopy } from "../../data/site";

export function HelpSection() {
  return (
    <section className="section help flow-panel flow-help" id="help" aria-labelledby="help-title">
      <div className="container">
        <ScrollReveal>
          <h2 id="help-title" className="help-title">
            {helpCopy.title}
          </h2>
        </ScrollReveal>

        <ScrollReveal as="ol" className="help-menu" stagger={100}>
          {helpBlocks.map((block) => (
            <li
              className={["help-item", block.flagship ? "is-flagship" : ""].filter(Boolean).join(" ")}
              key={block.n}
            >
              <p className="help-n" aria-hidden="true">
                {block.n}
              </p>
              <h3>
                {block.flagship ? <span className="help-flag">Флагман</span> : null}
                {block.title}
              </h3>
              <p>
                <span className="help-label">Что входит</span>
                {block.includes}
              </p>
              <p>
                <span className="help-label">Для кого</span>
                {block.audience}
              </p>
            </li>
          ))}
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <p className="help-package">{helpCopy.package}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
