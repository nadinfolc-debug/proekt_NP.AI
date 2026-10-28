import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { homeFaqCopy } from "../../data/site";
import { useSectionId } from "../../lib/useSectionId";
import { ScrollReveal } from "../ScrollReveal";
import { SectionBackdrop } from "../SectionBackdrop";

export function FaqSection() {
  const sectionId = useSectionId("faq");
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      className="section home-faq flow-panel flow-faq"
      id={sectionId}
      aria-labelledby="home-faq-title"
    >
      <SectionBackdrop />
      <div className="container">
        <ScrollReveal delay={40}>
          <div className="home-faq-head">
            <h2 id="home-faq-title" className="home-faq-title">
              {homeFaqCopy.title}
            </h2>
            <p className="home-faq-lead">{homeFaqCopy.lead}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal className="home-faq-panel" delay={70}>
          <div className="faq-wrap home-faq-wrap">
            {homeFaqCopy.items.map((item, index) => {
              const open = openIndex === index;
              const panelId = `${baseId}-panel-${index}`;
              const buttonId = `${baseId}-button-${index}`;
              return (
                <div className="faq-item" key={item.q}>
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(open ? -1 : index)}
                    >
                      {item.q}
                      <span aria-hidden="true">{open ? "−" : "+"}</span>
                    </button>
                  </h3>
                  {open ? (
                    <p id={panelId} role="region" aria-labelledby={buttonId}>
                      {item.a}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <p className="home-faq-more">
            <Link to={homeFaqCopy.moreHref}>{homeFaqCopy.moreLabel}</Link>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
