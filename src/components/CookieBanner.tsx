import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCookieConsent,
  setCookieConsent,
  type CookieConsentChoice,
} from "../lib/cookie-consent";
import { initMetrikaIfAllowed, isMetrikaConfigured } from "../lib/metrika";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getCookieConsent();
    if (existing) {
      initMetrikaIfAllowed();
      setVisible(false);
      return;
    }
    setVisible(true);
  }, []);

  function choose(choice: CookieConsentChoice) {
    setCookieConsent(choice);
    setVisible(false);
    if (choice === "all") initMetrikaIfAllowed();
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title" aria-live="polite">
      <div className="cookie-banner-inner">
        <div className="cookie-banner-copy">
          <p id="cookie-banner-title" className="cookie-banner-title">
            Файлы cookie
          </p>
          <p className="cookie-banner-text">
            {isMetrikaConfigured()
              ? "Мы используем необходимые cookie для работы сайта и, с вашего согласия, Яндекс Метрику для статистики посещений."
              : "Мы используем необходимые cookie для работы сайта."}{" "}
            Подробнее — в <Link to="/privacy">Политике обработки персональных данных</Link>.
          </p>
        </div>
        <div className="cookie-banner-actions">
          <button type="button" className="cookie-banner-btn cookie-banner-btn--ghost" onClick={() => choose("necessary")}>
            Только необходимые
          </button>
          <button type="button" className="cookie-banner-btn cookie-banner-btn--accent" onClick={() => choose("all")}>
            Принять все
          </button>
        </div>
      </div>
    </div>
  );
}
