import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { getGsap } from "../lib/gsap";

type RootTag = "div" | "ol" | "ul" | "section" | "figure";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  as?: RootTag;
  /** Delay before this block starts, ms */
  delay?: number;
  /** Stagger between direct children, ms (90–120 recommended) */
  stagger?: number;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ScrollReveal({
  children,
  className = "",
  as = "div",
  delay = 0,
  stagger = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const staggered = stagger > 0;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion()) {
      node.classList.add("is-in");
      node.querySelectorAll(".scroll-reveal-item").forEach((item) => {
        (item as HTMLElement).style.opacity = "1";
        (item as HTMLElement).style.transform = "none";
      });
      return;
    }

    const { gsap } = getGsap();
    const items = staggered
      ? Array.from(node.querySelectorAll<HTMLElement>(":scope > .scroll-reveal-item"))
      : [node];

    gsap.set(items, {
      opacity: 0,
      y: Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--motion-lift")) || 40,
      force3D: true,
    });

    const tween = gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--motion-duration")) || 0.9,
      ease: "power3.out",
      delay: delay / 1000,
      stagger: staggered ? stagger / 1000 : 0,
      scrollTrigger: {
        trigger: node,
        start: "top 88%",
        once: true,
      },
      onStart: () => node.classList.add("is-in"),
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, stagger, staggered]);

  const Tag = as;
  const classes = ["scroll-reveal", staggered ? "scroll-reveal-stagger" : "", className]
    .filter(Boolean)
    .join(" ");

  const content = staggered
    ? Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        const element = child as ReactElement<{ className?: string; style?: CSSProperties }>;
        return cloneElement(element, {
          className: [element.props.className, "scroll-reveal-item"].filter(Boolean).join(" "),
        });
      })
    : children;

  return (
    <Tag ref={ref as never} className={classes}>
      {content}
    </Tag>
  );
}
