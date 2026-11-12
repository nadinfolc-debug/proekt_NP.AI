import { helpBlocks, helpCopy } from "../../data/site";
import { asset } from "../../lib/asset";
import { useSectionId } from "../../lib/useSectionId";
import { ScrollReveal } from "../ScrollReveal";
import { SectionBackdrop } from "../SectionBackdrop";
import TumbleDeckShowcase, { type TumbleCard } from "../ui/tumble-deck-showcase";

export function HelpSection() {
  const sectionId = useSectionId("help");
  const cards: TumbleCard[] = helpBlocks.map((block) => ({
    src: asset(block.image),
    alt: block.imageAlt,
    n: block.n,
    category: block.category,
    title: block.title,
    lead: block.lead,
  }));

  return (
    <section className="section help flow-panel flow-help" id={sectionId} aria-labelledby="help-title">
      <SectionBackdrop />
      <div className="container">
        <ScrollReveal delay={40}>
          <h2 id="help-title" className="help-title">
            {helpCopy.title}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={60} className="help-deck-wrap">
          <TumbleDeckShowcase
            cards={cards}
            height="min(78svh, 680px)"
            aspect={0.78}
            depth={4}
            scrollPerCard={220}
            ariaLabel="Услуги — листать карточки"
            className="help-deck"
          />
          <p className="help-deck-hint">Листайте колёсиком, жестом или кликом</p>
        </ScrollReveal>

        <ScrollReveal delay={120} className="help-package-block">
          <p className="help-package-title">{helpCopy.packageTitle}</p>
          <p className="help-package">{helpCopy.package}</p>
          <div className="help-actions">
            {helpCopy.actions.map((action) => {
              const href = "asset" in action && action.asset ? asset(action.href) : action.href;
              return (
                <a
                  key={action.label}
                  className={`button help-action${
                    action.variant === "accent" ? " button-accent" : ""
                  }`}
                  href={href}
                  {...(action.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  {...("download" in action && action.download
                    ? { download: action.download }
                    : {})}
                >
                  {action.label}
                </a>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
