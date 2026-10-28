import portrait from "../../assets/about/portrait.png";
import { aboutCopy } from "../../data/site";
import { asset } from "../../lib/asset";
import { useSectionId } from "../../lib/useSectionId";
import { ScrollReveal } from "../ScrollReveal";

const aboutBackdrop = asset("media/works/обо мне.png");

function LavenderSprig({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M58 268C56 210 62 150 58 92C56 62 52 36 48 12"
        stroke="#6E66B8"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M58 200C72 188 86 176 94 158"
        stroke="#6E66B8"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M58 168C44 154 30 142 22 124"
        stroke="#6E66B8"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M58 132C70 122 80 108 84 94"
        stroke="#6E66B8"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.38"
      />
      <g fill="#C9C2FF" opacity="0.92">
        <ellipse cx="48" cy="28" rx="5.2" ry="9" transform="rotate(-18 48 28)" />
        <ellipse cx="56" cy="22" rx="5" ry="9.5" transform="rotate(-6 56 22)" />
        <ellipse cx="64" cy="28" rx="5.2" ry="9" transform="rotate(14 64 28)" />
        <ellipse cx="52" cy="40" rx="4.6" ry="8.2" transform="rotate(-12 52 40)" />
        <ellipse cx="60" cy="38" rx="4.8" ry="8.5" transform="rotate(8 60 38)" />
        <ellipse cx="50" cy="52" rx="4.4" ry="7.8" transform="rotate(-16 50 52)" />
        <ellipse cx="62" cy="50" rx="4.5" ry="8" transform="rotate(12 62 50)" />
        <ellipse cx="54" cy="64" rx="4.2" ry="7.4" transform="rotate(-8 54 64)" />
        <ellipse cx="61" cy="62" rx="4.1" ry="7.2" transform="rotate(10 61 62)" />
      </g>
      <g fill="#A89FE8" opacity="0.75">
        <ellipse cx="94" cy="158" rx="3.8" ry="6.6" transform="rotate(28 94 158)" />
        <ellipse cx="88" cy="166" rx="3.4" ry="6" transform="rotate(18 88 166)" />
        <ellipse cx="22" cy="124" rx="3.6" ry="6.4" transform="rotate(-32 22 124)" />
        <ellipse cx="28" cy="132" rx="3.2" ry="5.8" transform="rotate(-22 28 132)" />
        <ellipse cx="84" cy="94" rx="3.5" ry="6.2" transform="rotate(24 84 94)" />
      </g>
      <g fill="#BDEFD9" opacity="0.55">
        <path d="M70 188C78 182 84 176 86 170C80 174 74 180 70 188Z" />
        <path d="M46 176C38 170 32 164 30 158C36 162 42 168 46 176Z" />
      </g>
    </svg>
  );
}

function AboutDecor() {
  return (
    <div className="about-decor" aria-hidden="true">
      <svg className="about-decor-shapes" viewBox="0 0 520 640" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          className="about-blob about-blob--lavender"
          d="M310 48C390 62 470 130 488 220C508 320 460 410 390 470C320 528 220 540 150 500C78 458 48 360 70 270C94 172 210 30 310 48Z"
        />
        <path
          className="about-blob about-blob--mint"
          d="M120 180C180 150 250 170 290 230C340 300 320 390 250 440C180 490 90 470 50 400C12 330 50 216 120 180Z"
        />
        <path
          className="about-blob about-blob--lavender-soft"
          d="M360 300C430 320 470 390 450 460C428 536 340 560 280 520C220 480 220 380 270 340C300 316 330 290 360 300Z"
        />
        <path
          d="M80 520C160 480 250 500 340 560"
          stroke="#C9C2FF"
          strokeWidth="18"
          strokeLinecap="round"
          opacity="0.22"
        />
        <path
          d="M40 260C90 220 150 210 210 240"
          stroke="#BDEFD9"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>
      <LavenderSprig className="about-sprig about-sprig--left" />
      <LavenderSprig className="about-sprig about-sprig--right" />
      <LavenderSprig className="about-sprig about-sprig--top" />
    </div>
  );
}

export function AboutSection() {
  const sectionId = useSectionId("about");

  return (
    <section className="section about flow-panel flow-about" id={sectionId} aria-labelledby="about-title">
      <div className="about-atmosphere" aria-hidden="true">
        <img className="about-atmosphere-img" src={aboutBackdrop} alt="" decoding="async" />
      </div>

      <div className="container about-container">
        <div className="about-stage">
          <ScrollReveal className="about-copy" stagger={100} delay={40}>
            <h2 id="about-title" className="about-title">
              {aboutCopy.title}
            </h2>
            <p className="about-lead">{aboutCopy.lead}</p>
            {aboutCopy.paragraphs.map((paragraph) => (
              <p className="about-text" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </ScrollReveal>

          <div className="about-visual">
            <ScrollReveal className="about-decor-wrap" delay={120}>
              <AboutDecor />
            </ScrollReveal>

            <ScrollReveal as="figure" className="about-figure" delay={220}>
              <img
                className="about-cutout"
                src={portrait}
                alt={aboutCopy.imageAlt}
                width={900}
                height={1200}
                loading="lazy"
                decoding="async"
              />
            </ScrollReveal>
          </div>

          <ScrollReveal className="about-accents-wrap" delay={280}>
            <ul className="about-accents">
              {aboutCopy.accents.map((item) => (
                <li key={item.label}>
                  <span className="about-accent-label">{item.label}</span>
                  <span className="about-accent-note">{item.note}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
