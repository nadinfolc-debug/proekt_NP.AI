import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

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

function isInView(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh * 0.92 && rect.bottom > vh * 0.08;
}

export function ScrollReveal({
  children,
  className = "",
  as = "div",
  delay = 0,
  stagger = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }

    if (isInView(node)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      {
        // Any visible pixel is enough — ratio thresholds fail on tall sections.
        threshold: 0,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  const staggered = stagger > 0;
  const classes = [
    "scroll-reveal",
    staggered ? "scroll-reveal-stagger" : "",
    visible ? "is-in" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = staggered
    ? Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        const element = child as ReactElement<{ className?: string; style?: CSSProperties }>;
        const style: CSSProperties = {
          ...element.props.style,
          ["--sr-delay" as string]: `${delay + index * stagger}ms`,
        };
        return cloneElement(element, {
          className: [element.props.className, "scroll-reveal-item"].filter(Boolean).join(" "),
          style,
        });
      })
    : children;

  const rootStyle =
    !staggered && delay > 0
      ? ({ ["--sr-delay" as string]: `${delay}ms` } as CSSProperties)
      : undefined;

  return (
    <Tag ref={ref as never} className={classes} style={rootStyle}>
      {content}
    </Tag>
  );
}
