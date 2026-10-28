import portrait from "../../assets/about/portrait.png";
import { aboutCopy } from "../../data/site";
import { asset } from "../../lib/asset";
import { useSectionId } from "../../lib/useSectionId";
import { ScrollReveal } from "../ScrollReveal";

const aboutBackdrop = asset("media/works/обо мне.png");

export function AboutSection() {
  const sectionId = useSectionId("about");

  return (
    <section className="section about flow-panel flow-about" id={sectionId} aria-labelledby="about-title">
      <div className="about-atmosphere" aria-hidden="true">
        <img className="about-atmosphere-img" src={aboutBackdrop} alt="" decoding="async" />
      </div>

      <div className="container about-container">
        <div className="about-stage">
          <ScrollReveal className="about-copy" stagger={100} delay={40}>
            <h2 id="about-title" className="about-title">
              {aboutCopy.title}
            </h2>
            <p className="about-lead">{aboutCopy.lead}</p>
            {aboutCopy.paragraphs.map((paragraph) => (
              <p className="about-text" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </ScrollReveal>

          <div className="about-visual">
            <ScrollReveal as="figure" className="about-figure" delay={160}>
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

          <ScrollReveal className="about-accents-wrap" delay={220}>
            <ul className="about-accents">
              {aboutCopy.accents.map((item) => (
                <li key={item.label}>
                  <span className="about-accent-label">{item.label}</span>
                  <span className="about-accent-note">{item.note}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
