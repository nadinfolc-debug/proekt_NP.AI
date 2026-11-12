import { Link } from "react-router-dom";
import { contactChannels } from "../data/contacts";
import { SectionBackdrop } from "./SectionBackdrop";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <SectionBackdrop />
      <div className="container footer-grid">
        <div className="footer-col footer-col-social">
          <p className="footer-col-title">Соцсети</p>
          <nav className="footer-nav footer-nav-social" aria-label="Соцсети">
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
          </nav>
        </div>

        <div className="footer-col footer-col-docs">
          <p className="footer-col-title">Документы</p>
          <nav className="footer-nav footer-nav-docs" aria-label="Документы">
            <Link to="/privacy">Политика обработки ПДн</Link>
            <Link to="/consent">Согласие на обработку ПДн</Link>
            <Link to="/offer">Оферта</Link>
          </nav>
        </div>

        <div className="footer-col footer-col-brand">
          <p className="footer-brand-line">
            <span>NP.AI</span> Prikolota
          </p>
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
      </div>
    </footer>
  );
}
