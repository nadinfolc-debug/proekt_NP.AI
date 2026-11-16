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
  const [sent, setSent] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sent) return;
    successRef.current?.focus({ preventScroll: true });
    successRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
  }, [sent]);
  const [titleMain, titleAccent = ""] = ctaCopy.title.split(" ");

  return (
    <section className={`cta-band flow-panel flow-cta${sent ? " cta-band--sent" : ""}`} id={sectionId} aria-labelledby="cta-title">
      {!sent && <SectionBackdrop />}
      <div className="container">
        {sent ? (
          <div className="cta-success" role="status" tabIndex={-1} ref={successRef}>
            <h2 id="cta-title">Заявка отправлена</h2>
            <p>Спасибо! Отвечу в выбранном вами канале связи.</p>
          </div>
        ) : (
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
            <LeadForm onSent={() => setSent(true)} />
          </div>
        </ScrollReveal>
        )}
      </div>
    </section>
  );
}
import { useEffect, useRef, useState } from "react";
