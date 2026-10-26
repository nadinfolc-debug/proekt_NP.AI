import { ScrollReveal } from "../ScrollReveal";
import { aboutCopy } from "../../data/site";
import portrait from "../../assets/about/portrait.png";

export function AboutSection() {
  return (
    <section className="section about flow-panel flow-about" id="about" aria-labelledby="about-title">
      <div className="container">
        <ScrollReveal className="about-stage">
          <div className="about-copy">
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
          </div>

          <figure className="about-figure">
            <img
              className="about-cutout"
              src={portrait}
              alt={aboutCopy.imageAlt}
              width={900}
              height={1200}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </ScrollReveal>
      </div>
    </section>
  );
}
