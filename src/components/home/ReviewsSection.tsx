import { reviewsCopy } from "../../data/site";
import { useSectionId } from "../../lib/useSectionId";
import { ScrollReveal } from "../ScrollReveal";
import { SectionBackdrop } from "../SectionBackdrop";

export function ReviewsSection() {
  const sectionId = useSectionId("reviews");

  return (
    <section
      className="section reviews flow-panel flow-reviews"
      id={sectionId}
      aria-labelledby="reviews-title"
    >
      <SectionBackdrop />
      <div className="container">
        <ScrollReveal delay={40}>
          <div className="reviews-head">
            <h2 id="reviews-title" className="reviews-title">
              {reviewsCopy.title}
            </h2>
            <p className="reviews-lead">{reviewsCopy.lead}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal as="ul" className="reviews-list" stagger={90} delay={70}>
          {reviewsCopy.items.map((item) => (
            <li className="review-card" key={item.name}>
              <p className="review-focus">{item.focus}</p>
              <blockquote className="review-quote">
                <p>{item.quote}</p>
              </blockquote>
              <footer className="review-meta">
                <span className="review-name">{item.name}</span>
                <span className="review-role">{item.role}</span>
              </footer>
            </li>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
