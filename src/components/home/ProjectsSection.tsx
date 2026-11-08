import { projectsCopy } from "../../data/site";
import { asset } from "../../lib/asset";
import { useSectionId } from "../../lib/useSectionId";
import { ScrollReveal } from "../ScrollReveal";
import { SectionBackdrop } from "../SectionBackdrop";

export function ProjectsSection() {
  const sectionId = useSectionId("projects");

  return (
    <section
      className="section projects flow-panel flow-projects"
      id={sectionId}
      aria-labelledby="projects-title"
    >
      <SectionBackdrop />
      <div className="container">
        <ScrollReveal delay={40}>
          <h2 id="projects-title" className="projects-title">
            {projectsCopy.title}
          </h2>
        </ScrollReveal>

        <div className="projects-list">
          {projectsCopy.items.map((item) => (
            <ScrollReveal key={item.name} className="project-card" stagger={90} delay={80}>
              <figure className="project-media">
                <img
                  src={asset(item.image)}
                  alt={item.imageAlt}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
              <div className="project-copy">
                <h3 className="project-name">{item.name}</h3>
                <p className="project-text">{item.text}</p>
                {item.note ? <p className="project-note">{item.note}</p> : null}

                {item.actions.length > 0 ? (
                  <div className="project-actions">
                    {item.actions.map((action) => (
                      <a
                        key={action.label}
                        className={`button project-action${
                          action.variant === "accent" ? " button-accent" : ""
                        }`}
                        href={action.href}
                        {...(action.external
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                      >
                        {action.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={120} className="help-package-block projects-more">
          <p className="help-package-title">{projectsCopy.moreTitle}</p>
          <p className="help-package">{projectsCopy.moreText}</p>
          <div className="help-actions">
            {projectsCopy.moreActions.map((action) => (
              <a
                key={action.label}
                className={`button help-action${
                  action.variant === "accent" ? " button-accent" : ""
                }`}
                href={action.href}
                {...(action.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {action.label}
              </a>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
