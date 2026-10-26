import { CtaBand } from "../components/CtaBand";
import { AboutSection } from "../components/home/AboutSection";
import { HelpSection } from "../components/home/HelpSection";
import { Hero } from "../components/home/Hero";
import { PortfolioHandGallery } from "../components/PortfolioHandGallery";
import { ScrollReveal } from "../components/ScrollReveal";
import { Seo } from "../components/Seo";

const description =
  "Нейрофото, нейровидео, контент и сайты для бизнеса, брендов и личных проектов — от кадра до цельной подачи.";

export function HomePage() {
  return (
    <div className="flow-page">
      <Seo title="NP.AI Prikolota — AI-визуал, контент и сайты" description={description} />

      <div className="flow-slot flow-slot-hero">
        <Hero />
      </div>

      <div className="flow-slot flow-slot-works">
        <section className="section media-band flow-panel flow-works" id="works" aria-label="Портфолио">
          <div className="container">
            <ScrollReveal>
              <PortfolioHandGallery />
            </ScrollReveal>
          </div>
        </section>
      </div>

      <div className="flow-slot flow-slot-help">
        <HelpSection />
      </div>

      <div className="flow-slot flow-slot-about">
        <AboutSection />
      </div>

      <div className="flow-slot flow-slot-cta">
        <CtaBand />
      </div>
    </div>
  );
}
