import { useEffect, useRef, useState } from "react";
import { heroCopy } from "../../data/site";
import { asset } from "../../lib/asset";
import { scrollToSection } from "../../lib/scroll";
import TextType from "../TextType";

const heroSrc = asset("media/hero/hero.mp4");
const posterJpg = asset("media/hero/poster.jpg");
const posterWebp = asset("media/hero/poster.webp");

export function Hero() {
  const reduced = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || reduced) return;

    const play = () => {
      const pending = node.play();
      if (!pending) return;
      pending.then(() => setPlaying(true)).catch(() => setPlaying(false));
    };

    play();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          node.pause();
          setPlaying(false);
          return;
        }
        play();
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  const toggle = () => {
    const node = videoRef.current;
    if (!node) return;
    if (node.paused) {
      node.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      node.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="hero flow-panel flow-hero" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="true">
        <picture>
          <source srcSet={posterWebp} type="image/webp" />
          <img src={posterJpg} alt="" width={1280} height={720} fetchPriority="high" />
        </picture>
        {reduced ? null : (
          <video
            ref={videoRef}
            src={heroSrc}
            poster={posterJpg}
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
          />
        )}
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="container hero-content">
        {reduced ? (
          <h1 id="hero-title">{heroCopy.typed[0]}</h1>
        ) : (
          <TextType
            id="hero-title"
            as="h1"
            className="hero-type-title"
            text={[...heroCopy.typed]}
            typingSpeed={75}
            pauseDuration={1800}
            deletingSpeed={35}
            deleteMode="vanish"
            typeEffect="fade"
            mistakes={0}
            cursorStyle="bar"
            cursorGlide
            showCursor
            cursorColor="currentColor"
            prefixColor="currentColor"
            cursorBlinkDuration={0.55}
            cursorCharacter="_"
            prefix=""
            variableSpeed={{ min: 40, max: 170 }}
            startOnVisible
          />
        )}
        <p className="lead">{heroCopy.description}</p>
        <a
          className="hero-cta"
          href={`#${heroCopy.section}`}
          onClick={(event) => {
            event.preventDefault();
            scrollToSection(heroCopy.section);
          }}
        >
          <span>{heroCopy.link}</span>
          <span className="hero-cta-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
      </div>
      {reduced ? null : (
        <button type="button" className="hero-pause" onClick={toggle} aria-pressed={playing}>
          {playing ? "Пауза" : "Запустить ролик"}
        </button>
      )}
    </section>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return reduced;
}
