export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-bar">
        <p className="footer-brand-line">
          <span>NP.AI</span> Prikolota
        </p>
        <p className="footer-year">© {year}</p>
      </div>
    </footer>
  );
}
