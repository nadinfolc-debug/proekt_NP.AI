import portrait from "../../assets/about/portrait.png";
import { aboutCopy } from "../../data/site";
import { asset } from "../../lib/asset";
import { useSectionId } from "../../lib/useSectionId";
import { ScrollReveal } from "../ScrollReveal";
import { SectionBackdrop } from "../SectionBackdrop";

export function AboutSection() {
  const sectionId = useSectionId("about");

  return (
    <section
      className="section about flow-panel flow-about"
      id={sectionId}
      aria-labelledby="about-section-title"
    >
      <SectionBackdrop />

      <div className="container about-container">
        <ScrollReveal delay={30}>
          <h2 id="about-section-title" className="about-section-title">
            {aboutCopy.sectionTitle}
          </h2>
        </ScrollReveal>

        <div className="about-stage">
          <div className="about-main">
            <ScrollReveal className="about-copy" stagger={90} delay={50}>
              <h3 id="about-title" className="about-title">
                {aboutCopy.title}
              </h3>
              <p className="about-lead">{aboutCopy.lead}</p>
              {aboutCopy.paragraphs.map((paragraph) => (
                <p className="about-text" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </ScrollReveal>

            <ScrollReveal className="about-accents-wrap" delay={180}>
              <ul className="about-accents">
                {aboutCopy.accents.map((item) => (
                  <li key={item.label}>
                    <span className="about-accent-icon-wrap">
                      <img
                        className="about-accent-icon"
                        src={asset(item.icon)}
                        alt={item.iconAlt}
                        width={96}
                        height={96}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <div className="about-accent-copy">
                      <span className="about-accent-label">{item.label}</span>
                      <span className="about-accent-note">{item.note}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>

          <div className="about-visual">
            <ScrollReveal as="figure" className="about-figure" delay={140}>
              <img
                className="about-cutout"
                src={portrait}
                alt={aboutCopy.imageAlt}
                width={900}
                height={1200}
                loading="lazy"
                decoding="async"
              />
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
