import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import {
  consentSections,
  legalMeta,
  offerSections,
  privacySections,
} from "../data/legal";

type LegalKind = "privacy" | "offer" | "consent";

const copy: Record<
  LegalKind,
  {
    title: string;
    eyebrow: string;
    sections: typeof privacySections | typeof offerSections | typeof consentSections;
  }
> = {
  privacy: {
    title: "Политика конфиденциальности",
    eyebrow: "Документы",
    sections: privacySections,
  },
  offer: {
    title: "Публичная оферта",
    eyebrow: "Документы",
    sections: offerSections,
  },
  consent: {
    title: "Согласие на обработку персональных данных",
    eyebrow: "Документы",
    sections: consentSections,
  },
};

export function LegalPage({ kind }: { kind: LegalKind }) {
  const page = copy[kind];

  return (
    <div className="page legal-page">
      <Seo
        title={`${page.title} — ${legalMeta.brand}`}
        description={`${page.title} ${legalMeta.brand}. Актуальная версия документа.`}
      />
      <div className="container narrow">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className="lead legal-updated">Обновлено: {legalMeta.updatedAt}</p>

        <div className="legal-body">
          {page.sections.map((section) => (
            <section key={section.title} className="legal-block">
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <p className="legal-back">
          <Link to="/">На главную</Link>
          {" · "}
          <Link to="/privacy">Политика</Link>
          {" · "}
          <Link to="/consent">Согласие</Link>
          {" · "}
          <Link to="/offer">Оферта</Link>
        </p>
      </div>
    </div>
  );
}
