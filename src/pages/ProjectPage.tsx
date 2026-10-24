import { Link, useParams } from "react-router-dom";
import {
  categoryLabel,
  findProject,
  nextProject,
  type ImageMedia,
  type SlotMedia,
} from "../data/projects";
import { ContactLinks } from "../components/ContactLinks";
import { Gallery } from "../components/Gallery";
import { SiteFrame, Slot } from "../components/Media";
import { Seo } from "../components/Seo";
import { VideoPlayer } from "../components/VideoPlayer";
import { NotFoundPage } from "./NotFoundPage";

function isImage(item: ImageMedia | SlotMedia): item is ImageMedia {
  return item.kind === "image";
}

function isSlot(item: ImageMedia | SlotMedia): item is SlotMedia {
  return item.kind === "slot";
}

export function ProjectPage() {
  const { slug } = useParams();
  const project = findProject(slug);
  if (!project) return <NotFoundPage />;

  const next = nextProject(project.slug);
  const images = project.gallery.filter(isImage);
  const slots = project.gallery.filter(isSlot);

  return (
    <article className="page case">
      <Seo
        title={`${project.title} — NP.AI Prikolota`}
        description={project.seoDescription}
      />
      <div className="container">
        <p className="meta">
          <Link to="/projects">Проекты</Link>
          {" · "}
          {categoryLabel[project.category]}
          {project.isConcept ? " · Авторский концепт" : ""}
          {project.status === "draft" ? " · Черновик" : ""}
        </p>
        <h1>{project.title}</h1>
        <p className="lead">{project.summary}</p>
        {project.notice ? <p className="draft-note">{project.notice}</p> : null}

        {project.video ? <VideoPlayer video={project.video} /> : null}
        {project.cover.kind === "site" ? (
          <div className="case-frames">
            <SiteFrame />
            <SiteFrame compact />
          </div>
        ) : null}
        {project.cover.kind === "slot" && !project.video ? (
          <Slot
            title={project.cover.title}
            file={project.cover.file}
            note={project.cover.note}
            ratio={project.coverRatio}
          />
        ) : null}
        {project.cover.kind === "trio" ? (
          <div className="trio case-trio">
            <p>Визуал</p>
            <p>Видео</p>
            <p>Сайт</p>
            <span>Для VESPER эти три материала ещё не собраны</span>
          </div>
        ) : null}

        <div className="case-grid">
          <section>
            <h2>Задача</h2>
            <p>{project.task}</p>
          </section>
          <section>
            <h2>Идея</h2>
            <p>{project.idea}</p>
          </section>
          <section>
            <h2>Что создано</h2>
            {project.deliverables.length > 0 ? (
              <ul>
                {project.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>Материалы этой работы ещё не собраны. Ниже список файлов, которыми их можно заменить.</p>
            )}
          </section>
        </div>

        {project.structure ? (
          <section className="case-block">
            <h2>Структура</h2>
            <ol>
              {project.structure.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            {project.demoUrl ? (
              <p>
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  Открыть демосайт
                </a>
              </p>
            ) : (
              <p>Рабочей демоссылки нет: сайт ещё не опубликован.</p>
            )}
          </section>
        ) : null}

        {images.length > 0 ? (
          <section className="case-block">
            <h2>Галерея</h2>
            <Gallery images={images} />
          </section>
        ) : null}

        {slots.length > 0 ? (
          <section className="case-block">
            <h2>Кадры, которые ещё нужны</h2>
            <div className="slot-grid">
              {slots.map((slot) => (
                <Slot
                  key={slot.file}
                  title={slot.title}
                  file={slot.file}
                  note={slot.note}
                  ratio={`${slot.width} / ${slot.height}`}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="case-block">
          <h2>Форматы</h2>
          <ul>
            {project.formats.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {project.missing.length > 0 ? (
          <section className="case-block">
            <h2>Недостающие файлы</h2>
            <ul className="missing">
              {project.missing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <ContactLinks />

        {next ? (
          <p className="next-project">
            <Link to={`/projects/${next.slug}`}>Следующий проект: {next.title}</Link>
          </p>
        ) : null}
      </div>
    </article>
  );
}
