import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  filterPortfolio,
  portfolioWorks,
  type PortfolioKind,
  type PortfolioWork,
} from "../data/portfolioWorks";

const SELECT_VELOCITY = -600;
const HAND_SCALE = 0.72;

function fanTransform(index: number, count: number, spacing: number) {
  const offset = index - (count - 1) / 2;
  const stepDeg = count > 1 ? Math.min(9, 46 / (count - 1)) : 0;
  const rotate = offset * stepDeg;
  return {
    rotate,
    x: offset * spacing,
    y: Math.abs(rotate) * 1.9,
  };
}

export function PortfolioHandGallery({
  cardWidth = 224,
  kind = "all",
}: {
  cardWidth?: number;
  kind?: "all" | PortfolioKind;
}) {
  const cards = filterPortfolio(portfolioWorks, kind);
  const shouldReduceMotion = useReducedMotion();
  const fanRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const draggingRef = useRef(false);
  const [fanWidth, setFanWidth] = useState<number | null>(null);
  const [activeId, setActiveId] = useState(cards[0]?.id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [canDrag, setCanDrag] = useState(false);

  useEffect(() => {
    if (!cards.some((card) => card.id === activeId)) {
      setActiveId(cards[0]?.id);
    }
  }, [activeId, cards]);

  const safeActiveId = cards.some((card) => card.id === activeId) ? activeId : cards[0]?.id;
  const activeIndex = cards.findIndex((card) => card.id === safeActiveId);
  const activeCard = cards[activeIndex];

  useEffect(() => {
    setCanDrag(!window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    const node = fanRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setFanWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    for (const card of cards) {
      const node = videoRefs.current[card.id];
      if (!node) continue;
      if (card.id === safeActiveId && card.kind === "video" && !shouldReduceMotion) {
        node.muted = true;
        const pending = node.play();
        if (pending) pending.catch(() => undefined);
      } else {
        node.pause();
        try {
          node.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
    }
  }, [cards, safeActiveId, shouldReduceMotion]);

  const width = fanWidth === null ? cardWidth : Math.min(cardWidth, fanWidth * 0.55);
  const height = width * 1.4;
  const baseBottom = height * 0.09;
  const hoverLift = height * 0.34;
  const activeLift = height * 0.62;
  const selectDistance = -height * 0.5;

  const handCards = cards.filter((card) => card.id !== safeActiveId);
  const hoveredIndex = hoveredId ? handCards.findIndex((card) => card.id === hoveredId) : -1;

  const maxOffset = (handCards.length - 1) / 2;
  const halfAvailable =
    fanWidth === null ? Number.POSITIVE_INFINITY : fanWidth / 2 - width * 0.45;
  const fanSpacing =
    maxOffset > 0
      ? Math.min(
          width * (handCards.length > 5 ? 0.43 : 0.52),
          Math.max(width * 0.23, halfAvailable / maxOffset),
        )
      : 0;

  const cardTransition = shouldReduceMotion
    ? { duration: 0.16, ease: "easeOut" as const }
    : { damping: 30, mass: 0.9, stiffness: 340, type: "spring" as const };

  const textTransition = { duration: shouldReduceMotion ? 0 : 0.32 };
  const textOffset = shouldReduceMotion ? 0 : 10;

  function clearHover(id: string) {
    setHoveredId((current) => (current === id ? null : current));
  }

  function selectCard(card: PortfolioWork) {
    if (card.id === safeActiveId) return;
    clearHover(card.id);
    setActiveId(card.id);
  }

  if (cards.length === 0) {
    return <p className="lead">В этой категории пока нет материалов.</p>;
  }

  return (
    <div className="hand-gallery">
      <div className="hand-side hand-side-left" aria-live="polite">
        {activeCard ? (
          <motion.div
            key={`${activeCard.id}-desc`}
            initial={{ opacity: 0, y: textOffset }}
            animate={{ opacity: 1, y: 0 }}
            transition={textTransition}
          >
            <p className="hand-kicker">
              {activeCard.kind === "video" ? "Видео" : "Фото"} · {activeCard.title}
            </p>
            <p className="hand-description">{activeCard.description}</p>
          </motion.div>
        ) : null}
      </div>

      <div className="hand-fan" ref={fanRef} style={{ minHeight: height * 1.78 }}>
        {cards.map((card) => {
          const isActive = card.id === safeActiveId;
          const handIndex = handCards.findIndex((candidate) => candidate.id === card.id);

          let slot: { rotate: number; scale: number; x: number; y: number };
          let lift = { rotate: 0, scale: 1, x: 0, y: 0 };
          let zIndex: number;

          if (isActive) {
            slot = { rotate: 0, scale: 1, x: 0, y: -activeLift };
            zIndex = 100;
          } else {
            const fan = fanTransform(handIndex, handCards.length, fanSpacing);
            const isHovered = card.id === hoveredId;
            const neighborShift =
              hoveredIndex !== -1 && !isHovered
                ? (Math.sign(handIndex - hoveredIndex) * width * 0.14) /
                  Math.max(1, Math.abs(handIndex - hoveredIndex))
                : 0;
            const dx = neighborShift;
            const dy = isHovered ? -hoverLift - fan.y : 0;
            const rad = (-fan.rotate * Math.PI) / 180;

            slot = {
              rotate: fan.rotate,
              scale: HAND_SCALE,
              x: fan.x,
              y: fan.y,
            };
            lift = {
              rotate: isHovered ? -fan.rotate * 0.45 : 0,
              scale: isHovered ? 1.08 : 1,
              x: (dx * Math.cos(rad) - dy * Math.sin(rad)) / HAND_SCALE,
              y: (dx * Math.sin(rad) + dy * Math.cos(rad)) / HAND_SCALE,
            };
            zIndex = isHovered ? 60 : 10 + handIndex;
          }

          return (
            <motion.div
              key={card.id}
              className="hand-slot"
              animate={slot}
              initial={false}
              transition={cardTransition}
              onHoverEnd={() => clearHover(card.id)}
              onHoverStart={() => {
                if (!isActive) setHoveredId(card.id);
              }}
              style={{ bottom: baseBottom, marginLeft: -width / 2, zIndex }}
            >
              <motion.div animate={lift} initial={false} transition={cardTransition}>
                <motion.button
                  type="button"
                  aria-label={`${card.series}: ${card.title}`}
                  aria-pressed={isActive}
                  className={isActive ? "hand-card is-active" : "hand-card"}
                  drag={canDrag && !isActive ? "y" : false}
                  dragConstraints={{ bottom: 0, top: -height * 1.65 }}
                  dragElastic={0.12}
                  dragSnapToOrigin
                  onBlur={() => clearHover(card.id)}
                  onClick={() => {
                    if (draggingRef.current) {
                      draggingRef.current = false;
                      return;
                    }
                    selectCard(card);
                  }}
                  onDragEnd={(_event, info) => {
                    if (info.offset.y < selectDistance || info.velocity.y < SELECT_VELOCITY) {
                      selectCard(card);
                    }
                  }}
                  onDragStart={() => {
                    draggingRef.current = true;
                  }}
                  onFocus={() => {
                    if (!isActive) setHoveredId(card.id);
                  }}
                  onPointerDown={() => {
                    draggingRef.current = false;
                  }}
                >
                  <span className="hand-media-wrap" style={{ width, height }}>
                    {card.coverWebp ? (
                      <picture>
                        <source srcSet={card.coverWebp} type="image/webp" />
                        <img
                          className="hand-media"
                          src={card.cover}
                          alt=""
                          width={720}
                          height={1280}
                          draggable={false}
                        />
                      </picture>
                    ) : (
                      <img
                        className="hand-media"
                        src={card.cover}
                        alt=""
                        width={720}
                        height={1280}
                        draggable={false}
                      />
                    )}
                    {card.kind === "video" && card.videoSrc && !shouldReduceMotion ? (
                      <video
                        ref={(node) => {
                          videoRefs.current[card.id] = node;
                        }}
                        className={
                          isActive ? "hand-media hand-video is-on" : "hand-media hand-video"
                        }
                        src={card.videoSrc}
                        poster={card.cover}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : null}
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div className="hand-side hand-side-right">
        {activeCard ? (
          <motion.div
            key={`${activeCard.id}-title`}
            initial={{ opacity: 0, y: textOffset }}
            animate={{ opacity: 1, y: 0 }}
            transition={textTransition}
          >
            <p className="hand-count">
              {String(activeIndex + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
            </p>
            <h2 className="hand-series">{activeCard.series}</h2>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
