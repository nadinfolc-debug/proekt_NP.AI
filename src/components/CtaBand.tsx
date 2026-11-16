import { ctaCopy } from "../data/site";
import { useSectionId } from "../lib/useSectionId";
import { LeadForm } from "./LeadForm";
import { ScrollReveal } from "./ScrollReveal";
import { SectionBackdrop } from "./SectionBackdrop";

export function CtaBand({
  showFaqLink: _showFaqLink = true,
}: {
  showFaqLink?: boolean;
}) {
  const sectionId = useSectionId("discuss");
  const [titleMain, titleAccent = ""] = ctaCopy.title.split(" ");

  return (
    <section className="cta-band flow-panel flow-cta" id={sectionId} aria-labelledby="cta-title">
      <SectionBackdrop />
      <div className="container">
        <ScrollReveal className="cta-inner cta-inner--form" stagger={120} delay={40}>
          <div className="cta-copy">
            <p className="cta-eyebrow">Контакты</p>
            <h2 id="cta-title" className="cta-title">
              <span className="cta-title-main">{titleMain}</span>{" "}
              <span className="cta-title-accent">{titleAccent}</span>
            </h2>
            <p className="cta-lead">{ctaCopy.paragraphs[0]}</p>
            <p className="cta-note">
              <span className="cta-note-icon" aria-hidden="true">
                ✈
              </span>
              <span>{ctaCopy.paragraphs[1]}</span>
            </p>
          </div>

          <div className="cta-side">
            <LeadForm />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
