import { Link, Navigate, useSearchParams } from "react-router-dom";
import { PortfolioHandGallery } from "../components/PortfolioHandGallery";
import { ScrollReveal } from "../components/ScrollReveal";
import { SHOW_DRAFTS } from "../config";
import { categoryLabel, matchesFilter, visibleProjects, type Project } from "../data/projects";
import type { PortfolioKind } from "../data/portfolioWorks";
import { filters, projectsPageCopy, type FilterId } from "../data/site";
import { ContactLinks } from "../components/ContactLinks";
import { Cover } from "../components/Media";
import { Seo } from "../components/Seo";

type MediaFilter = "all" | PortfolioKind;

function isMediaFilter(value: string | null): value is MediaFilter {
  return value === "all" || value === "photo" || value === "video";
}

function isFilter(value: string | null): value is FilterId {
  return filters.some((item) => item.id === value);
}

const mediaFilters: { id: MediaFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "photo", label: "Фото" },
  { id: "video", label: "Видео" },
];

export function ProjectsPage() {
  const [params, setParams] = useSearchParams();
  const mediaParam = params.get("type");
  const media: MediaFilter = isMediaFilter(mediaParam) ? mediaParam : "all";
  const requested = params.get("filter");
  const filter: FilterId = isFilter(requested) ? requested : "all";
  const items = visibleProjects().filter((project) => matchesFilter(project, filter));

  const chooseMedia = (id: MediaFilter) => {
    const next = new URLSearchParams(params);
    if (id === "all") next.delete("type");
    else next.set("type", id);
    setParams(next);
  };

  const choose = (id: FilterId) => {
    const next = new URLSearchParams(params);
    if (id === "all") next.delete("filter");
    else next.set("filter", id);
    setParams(next);
  };

  return (
    <article className="page">
      <Seo
        title="Работы — NP.AI Prikolota"
        description="Фото и видео NP.AI Prikolota в одном портфолио: косметика, аксессуары, lifestyle, стилизация и другие серии."
      />
      <div className="container">
        <ScrollReveal stagger={90}>
          <p className="eyebrow">{projectsPageCopy.eyebrow}</p>
          <h1>{projectsPageCopy.title}</h1>
          <p className="lead">{projectsPageCopy.lead}</p>
          <div className="filters" role="group" aria-label="Тип материала">
            {mediaFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={media === item.id}
                onClick={() => chooseMedia(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </ScrollReveal>
      </div>
      <div className="container">
        <ScrollReveal>
          <PortfolioHandGallery kind={media} />
        </ScrollReveal>
      </div>
      <div className="container work-more">
        <ScrollReveal>
          <h2>{projectsPageCopy.more}</h2>
          {SHOW_DRAFTS ? (
            <p className="draft-note">
              Локальный просмотр: черновики видны для доработки. В обычной сборке незавершённые
              проекты скрыты.
            </p>
          ) : null}
          <div className="filters" role="group" aria-label="Фильтр проектов">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => choose(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </ScrollReveal>
        {items.length === 0 ? (
          <div className="empty">
            <p>В этой категории пока нет проектов для публикации.</p>
            <ContactLinks />
          </div>
        ) : (
          <ScrollReveal className="work-grid" stagger={100}>
            {items.map((project, index) => (
              <ProjectCard key={project.id} project={project} feature={index === 0} />
            ))}
          </ScrollReveal>
        )}
      </div>
    </article>
  );
}

export function VideosRedirect() {
  return <Navigate to="/projects?type=video" replace />;
}

function ProjectCard({ project, feature }: { project: Project; feature: boolean }) {
  const layout = feature ? "feature" : project.category === "visual" ? "tall" : "wide";
  return (
    <article className={`work-card ${layout}`}>
      <Link to={`/projects/${project.slug}`}>
        <Cover cover={project.cover} ratio={feature ? "16 / 8" : project.coverRatio} priority={feature} />
        <div className="work-copy">
          <p className="meta">
            {categoryLabel[project.category]}
            {project.isConcept ? " · Авторский концепт" : ""}
            {project.status === "draft" ? " · Черновик" : ""}
          </p>
          <h2>{project.title}</h2>
          <p>{project.summary}</p>
        </div>
      </Link>
    </article>
  );
}
