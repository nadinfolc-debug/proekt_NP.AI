import { useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import { photoWorks, type PhotoWork } from "../data/photoWorks";

type FanConfig = {
  distanceDivisor: number;
  velocityDivisor: number;
  sensitivity: number;
  xMultiplier: number;
  yMultiplier: number;
  rotationMultiplier: number;
  scaleReduction: number;
};

function fanConfig(width: number): FanConfig {
  if (width < 640) {
    return {
      distanceDivisor: 120,
      velocityDivisor: 500,
      sensitivity: 180,
      xMultiplier: 78,
      yMultiplier: 16,
      rotationMultiplier: 7,
      scaleReduction: 0.06,
    };
  }
  if (width < 1024) {
    return {
      distanceDivisor: 160,
      velocityDivisor: 650,
      sensitivity: 220,
      xMultiplier: 120,
      yMultiplier: 24,
      rotationMultiplier: 9,
      scaleReduction: 0.08,
    };
  }
  return {
    distanceDivisor: 200,
    velocityDivisor: 800,
    sensitivity: 250,
    xMultiplier: 168,
    yMultiplier: 28,
    rotationMultiplier: 10,
    scaleReduction: 0.1,
  };
}

function wrapIndex(value: number, total: number) {
  return ((value % total) + total) % total;
}

export function WorkCarousel() {
  const slides = photoWorks;
  const total = slides.length;
  const progress = useMotionValue(0);
  const startProgress = useRef(0);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const apply = () => setWidth(window.innerWidth);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const config = useMemo(() => fanConfig(width), [width]);

  useMotionValueEvent(progress, "change", (value) => {
    const next = wrapIndex(Math.round(value), total);
    setActive((current) => (current === next ? current : next));
  });

  const settle = (target: number) => {
    if (reduced) {
      progress.set(target);
      return;
    }
    animate(progress, target, { type: "spring", stiffness: 200, damping: 30, mass: 1 });
  };

  const step = (direction: number) => {
    settle(Math.round(progress.get()) + direction);
  };

  const onDragStart = () => {
    startProgress.current = progress.get();
  };

  const onDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    progress.set(progress.get() + -info.delta.x / config.sensitivity);
  };

  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const distanceShift = -info.offset.x / config.distanceDivisor;
    const velocityShift = -info.velocity.x / config.velocityDivisor;
    let shift = Math.round(distanceShift + velocityShift);
    shift = Math.max(-3, Math.min(3, shift));
    settle(Math.round(startProgress.current) + shift);
  };

  const slide = slides[active];

  return (
    <section className="work-fan" aria-roledescription="карусель" aria-label="Фотоработы">
      <div className="work-fan-stage">
        <motion.div
          className="work-fan-drag"
          aria-hidden="true"
          drag={reduced ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          onDragStart={onDragStart}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
        />
        {slides.map((item, index) => (
          <FanCard
            key={item.src}
            slide={item}
            index={index}
            total={total}
            progress={progress}
            config={config}
          />
        ))}
      </div>
      <div className="container work-fan-caption" aria-live="polite">
        <p className="eyebrow">{slide.series}</p>
        <p className="work-fan-title">{slide.title}</p>
        <p>{slide.description}</p>
        <div className="work-fan-controls">
          <button type="button" onClick={() => step(-1)}>
            Назад
          </button>
          <p>
            {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <button type="button" onClick={() => step(1)}>
            Дальше
          </button>
        </div>
      </div>
    </section>
  );
}

function FanCard({
  slide,
  index,
  total,
  progress,
  config,
}: {
  slide: PhotoWork;
  index: number;
  total: number;
  progress: MotionValue<number>;
  config: FanConfig;
}) {
  const offset = useTransform(progress, (value) => {
    let diff = (index - value) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  });
  const x = useTransform(offset, (value) => value * config.xMultiplier);
  const rotate = useTransform(offset, (value) =>
    Math.abs(value) < 0.05 ? 0 : value * config.rotationMultiplier,
  );
  const y = useTransform(offset, (value) => (Math.abs(value) < 0.05 ? 0 : Math.abs(value) * config.yMultiplier));
  const scale = useTransform(offset, (value) => 1 - Math.abs(value) * config.scaleReduction);
  const opacity = useTransform(offset, [-total / 2, -2.2, 0, 2.2, total / 2], [0, 1, 1, 1, 0]);
  const shade = useTransform(offset, [-2, -0.4, 0, 0.4, 2], [0.55, 0.28, 0, 0.28, 0.55]);
  const zIndex = useTransform(offset, (value) => Math.round(100 - Math.abs(value) * 10));

  return (
    <motion.article className="work-fan-card" style={{ x, y, rotate, scale, opacity, zIndex }} aria-hidden="true">
      <img
        src={slide.src}
        alt=""
        width={768}
        height={1152}
        draggable={false}
        fetchPriority={index === 0 ? "high" : "low"}
      />
      <motion.div className="work-fan-shade" style={{ opacity: shade }} />
    </motion.article>
  );
}
