import { contactChannels } from "../data/contacts";
import { ctaCopy } from "../data/site";
import { useSectionId } from "../lib/useSectionId";
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
        <ScrollReveal className="cta-inner" stagger={120} delay={40}>
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

          <div className="cta-card cta-channels">
            <p className="cta-channels-label">{ctaCopy.channelsHint}</p>
            <div className="cta-channel-list">
              {contactChannels.map((channel, index) => (
                <a
                  key={channel.id}
                  className={index === 0 ? "cta-channel cta-channel--accent" : "cta-channel"}
                  href={channel.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{channel.cta}</span>
                  <span className="cta-submit-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
