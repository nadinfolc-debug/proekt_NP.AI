import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navItems } from "../data/contacts";
import { scrollToSection, type ScrollState } from "../lib/scroll";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.key]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const sections = navItems
      .map((item) => document.getElementById(item.section))
      .filter((node): node is HTMLElement => Boolean(node));

    const syncActive = () => {
      const marker = window.scrollY + window.innerHeight * 0.28;
      let current = sections[0]?.id || "";
      for (const section of sections) {
        if (section.offsetTop <= marker) current = section.id;
      }
      setActiveSection(current);
    };

    syncActive();
    window.addEventListener("scroll", syncActive, { passive: true });
    return () => window.removeEventListener("scroll", syncActive);
  }, [location.pathname]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 981px)");
    const onChange = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const header = document.getElementById("site-header");
      const panel = document.getElementById("mobile-nav");
      if (!header || !panel) return;
      const items = [
        ...header.querySelectorAll<HTMLElement>("a, button"),
        ...panel.querySelectorAll<HTMLElement>("a, button"),
      ];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    document.querySelector<HTMLElement>("#mobile-nav a")?.focus();
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const goToSection = (event: MouseEvent<HTMLAnchorElement>, section: string) => {
    if (location.pathname === "/") {
      event.preventDefault();
      setOpen(false);
      scrollToSection(section);
      return;
    }
    event.preventDefault();
    setOpen(false);
    navigate("/", { state: { scrollTo: section } satisfies ScrollState });
  };

  const solid = open || scrolled || location.pathname !== "/";
  const overHero = location.pathname === "/" && !scrolled && !open;

  return (
    <header
      id="site-header"
      className={["header", solid ? "is-solid" : "", overHero ? "is-over-hero" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="header-bar">
        <Link
          className="logo"
          to="/"
          aria-label="NP.AI Prikolota, на главную"
          onClick={(event) => {
            if (location.pathname === "/") {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <span className="logo-main">NP.AI</span>
          <span className="logo-sub">Prikolota</span>
        </Link>
        <nav className="nav-desktop" aria-label="Разделы">
          {navItems.map((item) => (
            <Link
              key={item.section}
              to="/"
              aria-current={activeSection === item.section ? "page" : undefined}
              onClick={(event) => goToSection(event, item.section)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          ref={buttonRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Закрыть" : "Меню"}
        </button>
      </div>
      {open ? (
        <div id="mobile-nav" className="nav-panel" role="dialog" aria-modal="true" aria-label="Меню">
          <nav aria-label="Разделы">
            {navItems.map((item) => (
              <Link
                key={item.section}
                to="/"
                onClick={(event) => goToSection(event, item.section)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
