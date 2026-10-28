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
                <p className="project-tags">{item.tags.join(" · ")}</p>
                <p className="project-text">{item.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
