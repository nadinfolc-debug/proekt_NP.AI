import { helpBlocks, helpCopy } from "../../data/site";
import { asset } from "../../lib/asset";
import { useSectionId } from "../../lib/useSectionId";
import { ScrollReveal } from "../ScrollReveal";
import { SectionBackdrop } from "../SectionBackdrop";

export function HelpSection() {
  const sectionId = useSectionId("help");

  return (
    <section className="section help flow-panel flow-help" id={sectionId} aria-labelledby="help-title">
      <SectionBackdrop />
      <div className="container">
        <ScrollReveal delay={40}>
          <h2 id="help-title" className="help-title">
            {helpCopy.title}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={60} className="help-menu" stagger={70} as="ul">
          {helpBlocks.map((block) => (
            <li key={block.n} className="help-item">
              <div className="help-media">
                <img src={asset(block.image)} alt={block.imageAlt} loading="lazy" decoding="async" />
              </div>
              <p className="help-n">
                <span className="help-n-num">{block.n}</span>
                <span className="help-n-sep" aria-hidden="true">
                  /
                </span>
                <span className="help-n-cat">{block.category}</span>
              </p>
              <h3>{block.title}</h3>
              <p className="help-lead">{block.lead}</p>
            </li>
          ))}
        </ScrollReveal>

        <ScrollReveal delay={120} className="help-package-block">
          <p className="help-package-title">{helpCopy.packageTitle}</p>
          <p className="help-package">{helpCopy.package}</p>
          <div className="help-actions">
            {helpCopy.actions.map((action) => {
              const href = "asset" in action && action.asset ? asset(action.href) : action.href;
              return (
                <a
                  key={action.label}
                  className={`button help-action${
                    action.variant === "accent" ? " button-accent" : ""
                  }`}
                  href={href}
                  {...(action.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  {...("download" in action && action.download
                    ? { download: action.download }
                    : {})}
                >
                  {action.label}
                </a>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
