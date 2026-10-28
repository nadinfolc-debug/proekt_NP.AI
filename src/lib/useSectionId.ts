import { useLayoutEffect, useState } from "react";

/**
 * Delay section ids until after the first paint so a leftover URL hash
 * (e.g. #contacts) cannot auto-scroll the page past the hero on load.
 */
export function useSectionId(id: string) {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const timer = window.setTimeout(() => setReady(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return ready ? id : undefined;
}
