export type ScrollState = {
  scrollTo?: string;
};

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToSection(id: string, behavior?: ScrollBehavior) {
  const run = () => {
    const target = document.getElementById(id);
    if (!target) return false;
    target.scrollIntoView({
      behavior: behavior ?? (prefersReducedMotion() ? "auto" : "smooth"),
    });
    return true;
  };

  if (run()) return true;
  // Section ids are deferred on first paint — retry shortly.
  window.setTimeout(run, 30);
  window.setTimeout(run, 120);
  return false;
}
