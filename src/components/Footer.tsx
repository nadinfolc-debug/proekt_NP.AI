import { Link } from "react-router-dom";
import { contactChannels } from "../data/contacts";
import { legalMeta } from "../data/legal";
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
            <Link to="/privacy">Политика обработки персональных данных</Link>
            <Link to="/consent">Согласие на обработку персональных данных</Link>
            <Link to="/offer">Публичная оферта</Link>
          </nav>
        </div>

        <div className="footer-col footer-col-brand">
          <p className="footer-col-title">Контакты</p>
          <a className="footer-mail" href={`mailto:${legalMeta.email}`}>
            {legalMeta.email}
          </a>
          <p className="footer-requisites">
            {legalMeta.operatorFull}
            <br />
            ИНН {legalMeta.inn}
          </p>
          <p className="footer-year">
            <span className="footer-brand-line">
              <span>NP.AI</span> Prikolota
            </span>
            <span className="footer-sep" aria-hidden="true">
              ·
            </span>
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
