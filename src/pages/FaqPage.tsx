import { useId, useState } from "react";
import { CtaBand } from "../components/CtaBand";
import { ScrollReveal } from "../components/ScrollReveal";
import { faqPageCopy, faqs } from "../data/site";
import { Seo } from "../components/Seo";

export function FaqPage() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <article className="page">
      <Seo
        title="Вопросы и ответы — NP.AI Prikolota"
        description="Как устроена работа NP.AI Prikolota: форматы, старт, сроки, правки и использование материалов. Можно написать о задаче в Telegram."
        jsonLd={jsonLd}
      />
      <div className="container faq-page">
        <ScrollReveal stagger={90}>
          <p className="eyebrow">{faqPageCopy.eyebrow}</p>
          <h1>{faqPageCopy.title}</h1>
          <p className="lead">{faqPageCopy.lead}</p>
        </ScrollReveal>

        <ScrollReveal className="faq-wrap" stagger={90}>
          {faqs.map((item, index) => {
            const open = openIndex === index;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;
            return (
              <div className="faq-item" key={item.q}>
                <h2>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : index)}
                  >
                    {item.q}
                    <span aria-hidden="true">{open ? "−" : "+"}</span>
                  </button>
                </h2>
                {open ? (
                  <p id={panelId} role="region" aria-labelledby={buttonId}>
                    {item.a}
                  </p>
                ) : null}
              </div>
            );
          })}
        </ScrollReveal>
      </div>
      <CtaBand showFaqLink={false} />
    </article>
  );
}
