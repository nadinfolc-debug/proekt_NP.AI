import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { legalMeta, offerSections, privacySections } from "../data/legal";

type LegalKind = "privacy" | "offer";

const copy: Record<
  LegalKind,
  { title: string; eyebrow: string; sections: typeof privacySections | typeof offerSections }
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
          <Link to={kind === "privacy" ? "/offer" : "/privacy"}>
            {kind === "privacy" ? "Оферта" : "Политика конфиденциальности"}
          </Link>
        </p>
      </div>
    </div>
  );
}
