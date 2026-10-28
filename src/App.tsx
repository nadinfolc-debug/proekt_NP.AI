import { useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { scrollToSection, type ScrollState } from "./lib/scroll";
import { AdminPage } from "./pages/AdminPage";
import { FaqPage } from "./pages/FaqPage";
import { HomePage } from "./pages/HomePage";
import { LegalPage } from "./pages/LegalPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProjectPage } from "./pages/ProjectPage";
import { ProjectsPage, VideosRedirect } from "./pages/ProjectsPage";

function forcePageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function ScrollManager() {
  const location = useLocation();
  const navigate = useNavigate();
  const booted = useRef(false);
  const prevPathname = useRef(location.pathname);
  const handledScrollKey = useRef("");

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Kill leftover #contacts before React paints sections.
    if (window.location.hash) {
      const clean = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", clean);
    }
    forcePageTop();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) forcePageTop();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    // First paint of the app: always show the hero.
    if (!booted.current) {
      booted.current = true;
      if (location.hash) {
        navigate(
          { pathname: location.pathname, search: location.search, hash: "" },
          { replace: true, state: null },
        );
      }
      forcePageTop();
      const t0 = window.setTimeout(forcePageTop, 0);
      const t1 = window.setTimeout(forcePageTop, 50);
      const t2 = window.setTimeout(forcePageTop, 150);
      prevPathname.current = location.pathname;
      return () => {
        window.clearTimeout(t0);
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }

    if (location.hash) {
      navigate(
        { pathname: location.pathname, search: location.search, hash: "" },
        { replace: true, state: null },
      );
      forcePageTop();
      prevPathname.current = location.pathname;
      return;
    }

    const state = (location.state || {}) as ScrollState;
    const section = state.scrollTo;
    if (section) {
      const key = `${location.key}:${section}`;
      if (handledScrollKey.current === key) return;
      handledScrollKey.current = key;

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollToSection(section);
          navigate(
            { pathname: location.pathname, search: location.search, hash: "" },
            { replace: true, state: null },
          );
        });
      });
      prevPathname.current = location.pathname;
      return;
    }

    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname;
      forcePageTop();
    }
  }, [location.pathname, location.search, location.hash, location.key, location.state, navigate]);

  return null;
}

function Shell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollManager />
      <a className="skip" href="#main">
        К содержанию
      </a>
      {isAdmin ? null : <Header />}
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="/videos" element={<VideosRedirect />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/offer" element={<LegalPage kind="offer" />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {isAdmin ? null : <Footer />}
    </>
  );
}

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

export function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <Shell />
    </BrowserRouter>
  );
}
