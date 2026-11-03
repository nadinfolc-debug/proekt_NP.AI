import { useEffect, useState } from "react";
import { applyTheme, resolveTheme, toggleTheme, type Theme } from "../lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const current = resolveTheme();
    applyTheme(current);
    setThemeState(current);

    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<Theme>).detail;
      if (detail === "light" || detail === "dark") setThemeState(detail);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "np-theme") return;
      const next = resolveTheme();
      applyTheme(next);
      setThemeState(next);
    };

    window.addEventListener("np-theme", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("np-theme", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const dark = theme === "dark";

  return (
    <button
      type="button"
      className={["theme-toggle", className].filter(Boolean).join(" ")}
      aria-label={dark ? "Включить светлую тему" : "Включить тёмную тему"}
      aria-pressed={dark}
      title={dark ? "Светлая тема" : "Тёмная тема"}
      onClick={() => setThemeState(toggleTheme())}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {dark ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.75" />
            <path
              d="M12 2.75v2.1M12 19.15v2.1M21.25 12h-2.1M4.85 12H2.75M18.54 5.46l-1.48 1.48M6.94 17.06l-1.48 1.48M18.54 18.54l-1.48-1.48M6.94 6.94 5.46 5.46"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path
              d="M20.2 13.35A7.7 7.7 0 0 1 10.65 3.8 7.85 7.85 0 1 0 20.2 13.35Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
