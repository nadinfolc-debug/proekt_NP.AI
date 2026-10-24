import type { ReactNode } from "react";
import { SHOW_DRAFTS } from "../config";
import type { ImageMedia, Project } from "../data/projects";

type PictureProps = {
  image: ImageMedia;
  priority?: boolean;
  alt?: string;
};

export function Picture({ image, priority = false, alt }: PictureProps) {
  return (
    <picture>
      <source srcSet={image.webp} type="image/webp" />
      <img
        src={image.jpg}
        alt={alt ?? image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}

type SlotProps = {
  title: string;
  file: string;
  note: string;
  ratio: string;
  className?: string;
};

export function Slot({ title, file, note, ratio, className }: SlotProps) {
  return (
    <div className={className ? `slot ${className}` : "slot"} style={{ aspectRatio: ratio }}>
      <p className="slot-kicker">Материал готовится</p>
      <strong>{title}</strong>
      <p>{note}</p>
      {SHOW_DRAFTS ? <p className="slot-file">{file}</p> : null}
    </div>
  );
}

export function Cover({
  cover,
  ratio,
  priority = false,
}: {
  cover: Project["cover"];
  ratio: string;
  priority?: boolean;
}) {
  if (cover.kind === "image") {
    return (
      <div className="work-cover" style={{ aspectRatio: ratio }}>
        <Picture image={cover} priority={priority} alt="" />
      </div>
    );
  }

  if (cover.kind === "site") {
    return (
      <div className="work-cover work-cover-plain" style={{ aspectRatio: ratio }}>
        <SiteFrame />
      </div>
    );
  }

  if (cover.kind === "trio") {
    return (
      <div className="work-cover trio" style={{ aspectRatio: ratio }}>
        <p>Визуал</p>
        <p>Видео</p>
        <p>Сайт</p>
        <span>Материалы серии готовятся</span>
      </div>
    );
  }

  return <Slot title={cover.title} file={cover.file} note={cover.note} ratio={ratio} />;
}

export function SiteFrame({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "browser browser-compact" : "browser"}>
      <div className="browser-top">
        <span />
        <span />
        <span />
        <p>структура лендинга</p>
      </div>
      <div className="browser-body">
        <p className="eyebrow">Авторский концепт</p>
        <strong>VESPER</strong>
        <p>Парфюм. Образ, продукт и обращение на одной странице.</p>
        <ol>
          <li>Первый экран</li>
          <li>Продукт</li>
          <li>Серия кадров</li>
          <li>Контакт</li>
        </ol>
      </div>
    </div>
  );
}

export function SectionIntro({
  id,
  eyebrow,
  title,
  text,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  text: string;
}) {
  const titleId = id ? `${id}-title` : undefined;
  return (
    <div className="section-intro">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 id={titleId}>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

export function DraftNote({ children }: { children: ReactNode }) {
  return <p className="draft-note">{children}</p>;
}
