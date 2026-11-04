import { useEffect, type ReactNode } from "react";
import { getGsap } from "../lib/gsap";

/**
 * Makes home flow panels rise into place on scroll via GSAP ScrollTrigger.
 * Skips sticky hero/help panels (transform would break position:sticky).
 */
export function FlowRise({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { gsap, ScrollTrigger } = getGsap();
    const panels = gsap.utils.toArray<HTMLElement>(
      ".flow-page .flow-projects, .flow-page .flow-about, .flow-page .flow-faq, .flow-page .flow-reviews, .flow-page .flow-cta, .flow-page .flow-help",
    );

    const tweens = panels.map((panel) => {
      const sticky = getComputedStyle(panel).position === "sticky";
      // Sticky panels: animate inner content only so pin/sticky stays intact.
      const target = sticky
        ? panel.querySelector<HTMLElement>(":scope > .container, :scope > .about-container") || panel
        : panel;

      return gsap.fromTo(
        target,
        { y: sticky ? 36 : 88, opacity: sticky ? 1 : 0.92 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            start: "top bottom",
            end: "top 42%",
            scrub: 0.75,
          },
        },
      );
    });

    return () => {
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
      ScrollTrigger.refresh();
    };
  }, []);

  return children;
}
