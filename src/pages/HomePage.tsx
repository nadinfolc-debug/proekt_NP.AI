import { CtaBand } from "../components/CtaBand";
import { AboutSection } from "../components/home/AboutSection";
import { FaqSection } from "../components/home/FaqSection";
import { HelpSection } from "../components/home/HelpSection";
import { Hero } from "../components/home/Hero";
import { ProjectsSection } from "../components/home/ProjectsSection";
import { ReviewsSection } from "../components/home/ReviewsSection";
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

      <div className="flow-slot flow-slot-help">
        <HelpSection />
      </div>

      <div className="flow-slot flow-slot-projects">
        <ProjectsSection />
      </div>

      <div className="flow-slot flow-slot-about">
        <AboutSection />
      </div>

      <div className="flow-slot flow-slot-faq">
        <FaqSection />
      </div>

      <div className="flow-slot flow-slot-reviews">
        <ReviewsSection />
      </div>

      <div className="flow-slot flow-slot-cta">
        <CtaBand />
      </div>
    </div>
  );
}
