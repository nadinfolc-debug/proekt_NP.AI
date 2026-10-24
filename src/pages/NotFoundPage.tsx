import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";

export function NotFoundPage() {
  return (
    <article className="page empty-page">
      <Seo
        title="Страница не найдена — NP.AI Prikolota"
        description="Такой страницы на сайте NP.AI Prikolota нет."
      />
      <div className="container">
        <p className="eyebrow">404</p>
        <h1>Такой страницы нет.</h1>
        <p className="lead">Проверьте адрес или вернитесь к проектам и контактам.</p>
        <div className="hero-actions">
          <Link className="button button-accent" to="/">
            На главную
          </Link>
          <Link className="button" to="/projects">
            Смотреть проекты
          </Link>
        </div>
      </div>
    </article>
  );
}
