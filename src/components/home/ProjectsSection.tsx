import { projectsCopy } from "../../data/site";
import { asset } from "../../lib/asset";
import { scrollToSection } from "../../lib/scroll";
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
                <p className="project-eyebrow">{item.eyebrow}</p>
                <h3 className="project-name">{item.name}</h3>
                <p className="project-text">{item.text}</p>

                <div className="project-includes">
                  <p className="project-includes-title">{item.includesTitle}</p>
                  <ul className="project-chips">
                    {item.includes.map((chip, index) => (
                      <li
                        key={chip}
                        className={`project-chip project-chip-${(index % 3) + 1}`}
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="project-actions">
                  {item.actions.map((action) => {
                    const className = `button project-action${
                      action.variant === "accent" ? " button-accent" : ""
                    }`;

                    if ("section" in action && action.section) {
                      return (
                        <a
                          key={action.label}
                          className={className}
                          href={`#${action.section}`}
                          onClick={(event) => {
                            event.preventDefault();
                            scrollToSection(action.section);
                          }}
                        >
                          {action.label}
                        </a>
                      );
                    }

                    return (
                      <a
                        key={action.label}
                        className={className}
                        href={action.href}
                        {...(action.external
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                      >
                        {action.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
