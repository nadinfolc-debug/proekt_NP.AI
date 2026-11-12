import { Link } from "react-router-dom";
import { contactChannels } from "../data/contacts";
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
        <nav className="footer-nav" aria-label="Документы и связь">
          {contactChannels.map((channel) => (
            <a
              key={channel.id}
              className="footer-social"
              href={channel.href}
              target="_blank"
              rel="noreferrer"
            >
              {channel.label}
            </a>
          ))}
          <Link to="/privacy">Политика обработки ПДн</Link>
          <Link to="/consent">Согласие на обработку ПДн</Link>
          <Link to="/offer">Оферта</Link>
        </nav>
        <p className="footer-year">
          © {year}
          <span className="footer-sep" aria-hidden="true">
            ·
          </span>
          <Link to="/admin" className="footer-cabinet">
            Кабинет
          </Link>
        </p>
      </div>
    </footer>
  );
}
