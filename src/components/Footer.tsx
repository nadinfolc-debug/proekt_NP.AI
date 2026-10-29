import { Link } from "react-router-dom";
import { socialLinks } from "../data/contacts";
import { SectionBackdrop } from "./SectionBackdrop";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <SectionBackdrop />
      <div className="container footer-bar">
        <p className="footer-brand-line">
          <span>NP.AI</span> Prikolota
        </p>
        <nav className="footer-nav" aria-label="Документы">
          <a href={socialLinks.telegram.href} target="_blank" rel="noreferrer">
            {socialLinks.telegram.label}
          </a>
          <Link to="/privacy">Политика конфиденциальности</Link>
          <Link to="/offer">Оферта</Link>
        </nav>
        <p className="footer-year">© {year}</p>
      </div>
    </footer>
  );
}
