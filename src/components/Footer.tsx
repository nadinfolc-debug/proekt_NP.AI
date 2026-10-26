import { Link } from "react-router-dom";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-bar">
        <p className="footer-brand-line">
          <span>NP.AI</span> Prikolota
        </p>
        <nav className="footer-nav" aria-label="Документы">
          <Link to="/privacy">Политика конфиденциальности</Link>
          <Link to="/offer">Оферта</Link>
        </nav>
        <p className="footer-year">© {year}</p>
      </div>
    </footer>
  );
}
