import portrait from "../../assets/about/portrait.png";
import { aboutCopy } from "../../data/site";
import { useSectionId } from "../../lib/useSectionId";
import { ScrollReveal } from "../ScrollReveal";

export function AboutSection() {
  const sectionId = useSectionId("about");

  return (
    <section className="section about flow-panel flow-about" id={sectionId} aria-labelledby="about-title">
      <div className="container">
        <div className="about-stage">
          <ScrollReveal className="about-copy" stagger={90}>
            <h2 id="about-title" className="about-title">
              {aboutCopy.title}
            </h2>
            <p className="about-lead">{aboutCopy.lead}</p>
            {aboutCopy.paragraphs.map((paragraph) => (
              <p className="about-text" key={paragraph}>
                {paragraph}
              </p>
            ))}
            <p className="about-creates-title">{aboutCopy.createsTitle}</p>
            <ul className="about-creates">
              {aboutCopy.creates.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {aboutCopy.closing.map((paragraph) => (
              <p className="about-text" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </ScrollReveal>

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
      </div>
    </section>
  );
}
