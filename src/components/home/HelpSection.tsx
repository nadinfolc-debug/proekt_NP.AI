import { useCallback, useEffect, useRef, useState } from "react";
import { helpBlocks, helpCopy } from "../../data/site";
import { asset } from "../../lib/asset";
import { useSectionId } from "../../lib/useSectionId";
import { ScrollReveal } from "../ScrollReveal";

export function HelpSection() {
  const sectionId = useSectionId("help");
  const menuRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveFromScroll = useCallback(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const items = [...menu.querySelectorAll<HTMLElement>(".help-item")];
    if (!items.length) return;

    const mid = menu.scrollLeft + menu.clientWidth / 2;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    items.forEach((item, index) => {
      const center = item.offsetLeft + item.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    setActiveIndex(best);
  }, []);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    updateActiveFromScroll();
    menu.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    window.addEventListener("resize", updateActiveFromScroll);

    return () => {
      menu.removeEventListener("scroll", updateActiveFromScroll);
      window.removeEventListener("resize", updateActiveFromScroll);
    };
  }, [updateActiveFromScroll]);

  const goToSlide = (index: number) => {
    const menu = menuRef.current;
    if (!menu) return;
    const item = menu.querySelectorAll<HTMLElement>(".help-item")[index];
    if (!item) return;
    menu.scrollTo({ left: item.offsetLeft, behavior: "smooth" });
    setActiveIndex(index);
  };

  return (
    <section className="section help flow-panel flow-help" id={sectionId} aria-labelledby="help-title">
      <div className="container">
        <ScrollReveal delay={40}>
          <h2 id="help-title" className="help-title">
            {helpCopy.title}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={80} className="help-carousel">
          <ol ref={menuRef} className="help-menu">
            {helpBlocks.map((block) => (
              <li
                className={["help-item", block.flagship ? "is-flagship" : ""].filter(Boolean).join(" ")}
                key={block.n}
              >
                <p className="help-n" aria-hidden="true">
                  <span className="help-n-num">{block.n}</span>
                  <span className="help-n-sep" aria-hidden="true">
                    /
                  </span>
                  <span className="help-n-cat">{block.category}</span>
                </p>
                <figure className="help-media">
                  <img src={asset(block.image)} alt={block.imageAlt} loading="lazy" decoding="async" />
                </figure>
                <h3>{block.title}</h3>
                <p className="help-lead">{block.lead}</p>
              </li>
            ))}
          </ol>

          <div className="help-dots" role="tablist" aria-label="Слайды услуг">
            {helpBlocks.map((block, index) => (
              <button
                key={block.n}
                type="button"
                role="tab"
                className={["help-dot", index === activeIndex ? "is-active" : ""].filter(Boolean).join(" ")}
                aria-selected={index === activeIndex}
                aria-label={`Услуга ${index + 1}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120} className="help-package-block">
          <p className="help-package-title">{helpCopy.packageTitle}</p>
          <p className="help-package">{helpCopy.package}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
