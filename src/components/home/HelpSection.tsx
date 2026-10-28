import { helpBlocks, helpCopy } from "../../data/site";
import { asset } from "../../lib/asset";
import { useSectionId } from "../../lib/useSectionId";
import { ScrollReveal } from "../ScrollReveal";

export function HelpSection() {
  const sectionId = useSectionId("help");

  return (
    <section className="section help flow-panel flow-help" id={sectionId} aria-labelledby="help-title">
      <div className="container">
        <ScrollReveal delay={40}>
          <h2 id="help-title" className="help-title">
            {helpCopy.title}
          </h2>
        </ScrollReveal>

        <ScrollReveal as="ol" className="help-menu" stagger={90} delay={60}>
          {helpBlocks.map((block) => (
            <li
              className={["help-item", block.flagship ? "is-flagship" : ""].filter(Boolean).join(" ")}
              key={block.n}
            >
              <p className="help-n" aria-hidden="true">
                <span className="help-n-num">{block.n}</span>
                <span className="help-n-sep" aria-hidden="true">
                  /
                </span>
                <span className="help-n-cat">{block.category}</span>
              </p>
              <figure className="help-media">
                <img src={asset(block.image)} alt={block.imageAlt} loading="lazy" decoding="async" />
              </figure>
              <h3>{block.title}</h3>
              <p className="help-lead">{block.lead}</p>
            </li>
          ))}
        </ScrollReveal>

        <ScrollReveal delay={120} className="help-package-block">
          <p className="help-package-title">{helpCopy.packageTitle}</p>
          <p className="help-package">{helpCopy.package}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
