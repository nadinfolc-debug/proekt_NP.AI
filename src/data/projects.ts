import { SHOW_DRAFTS } from "../config";
import { asset } from "../lib/asset";

export type Category = "visual" | "video" | "web" | "complex";

export type ImageMedia = {
  kind: "image";
  webp: string;
  jpg: string;
  width: number;
  height: number;
  alt: string;
};

export type VideoMedia = {
  kind: "video";
  src: string;
  posterWebp: string;
  posterJpg: string;
  width: number;
  height: number;
  label: string;
};

export type SlotMedia = {
  kind: "slot";
  title: string;
  file: string;
  width: number;
  height: number;
  note: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: Category;
  status: "draft" | "ready";
  isConcept: boolean;
  summary: string;
  seoDescription: string;
  cover: ImageMedia | SlotMedia | { kind: "site" } | { kind: "trio" };
  coverRatio: string;
  video?: VideoMedia;
  gallery: Array<ImageMedia | SlotMedia>;
  task: string;
  idea: string;
  deliverables: string[];
  formats: string[];
  structure?: string[];
  demoUrl?: string;
  missing: string[];
  notice?: string;
};

const snow = asset("media/snow");

const snowPoster: ImageMedia = {
  kind: "image",
  webp: `${snow}/poster.webp`,
  jpg: `${snow}/poster.jpg`,
  width: 1280,
  height: 720,
  alt: "Человек в светлой шубе стоит на снегу с лыжами на плечах, на фоне гор.",
};

const snowFrames: ImageMedia[] = [
  {
    kind: "image",
    webp: `${snow}/frame-01.webp`,
    jpg: `${snow}/frame-01.jpg`,
    width: 1280,
    height: 720,
    alt: "Человек в светлой шубе идёт по снегу с лыжами на плечах.",
  },
  {
    kind: "image",
    webp: `${snow}/frame-02.webp`,
    jpg: `${snow}/frame-02.jpg`,
    width: 1280,
    height: 720,
    alt: "Портрет в светлой шубе между двумя вертикально поставленными лыжами.",
  },
  {
    kind: "image",
    webp: `${snow}/frame-03.webp`,
    jpg: `${snow}/frame-03.jpg`,
    width: 1280,
    height: 720,
    alt: "Широкий снежный план: небольшая фигура на фоне горной вершины.",
  },
];

export const featuredReel = {
  href: "/projects/snezhny-kadr",
  title: "Снежный кадр",
  note: "Авторский концепт",
  frames: [snowPoster, ...snowFrames],
};

const publishedProjects: Project[] = [
  {
    id: "snow-film",
    slug: "snezhny-kadr",
    title: "Снежный кадр",
    category: "video",
    status: "ready",
    isConcept: true,
    summary: "Короткий имиджевый ролик: фигура, снег и спокойное движение камеры.",
    seoDescription:
      "Авторский концепт NP.AI Prikolota: горизонтальный имиджевый ролик «Снежный кадр». Не клиентский кейс.",
    cover: snowPoster,
    coverRatio: "16 / 9",
    video: {
      kind: "video",
      src: `${snow}/film.mp4`,
      posterWebp: `${snow}/poster.webp`,
      posterJpg: `${snow}/poster.jpg`,
      width: 1280,
      height: 720,
      label:
        "Имиджевый ролик «Снежный кадр», около 27 секунд. Звук по умолчанию выключен.",
    },
    gallery: snowFrames,
    task: "Показать, как выглядит горизонтальный имиджевый ролик без интерфейса соцсетей.",
    idea: "Широкий снежный план, холодный свет и крупный портрет. Настроение держится на кадре, а не на тексте.",
    deliverables: [
      "Горизонтальный ролик около 27 секунд",
      "Обложка",
      "Три кадра для просмотра",
    ],
    formats: [
      "MP4, H.264, 1280×720",
      "Около 27 секунд",
      "Звук есть, в плеере выключен, пока его не включат",
      "Субтитры не приложены. Если в звуке есть речь, нужен файл captions.vtt",
    ],
    missing: [
      "public/media/snow/captions.vtt — только если в ролике есть речь",
    ],
    notice: "Авторский концепт. Это не клиентский кейс и не часть серии VESPER.",
  },
];

const draftProjects: Project[] = [
  {
    id: "vesper-visual",
    slug: "vesper-visual",
    title: "VESPER. Рекламная серия",
    category: "visual",
    status: "draft",
    isConcept: true,
    summary:
      "Авторский концепт парфюма: серия изображений одного флакона. Файлы ещё не подготовлены.",
    seoDescription:
      "Авторский концепт рекламной серии VESPER. Материалы изображений ещё готовятся.",
    cover: {
      kind: "slot",
      title: "Главный кадр серии",
      file: "public/media/vesper/cover.webp",
      width: 4,
      height: 5,
      note: "Рекламное изображение флакона. Слот заменится файлом.",
    },
    coverRatio: "4 / 5",
    gallery: [
      {
        kind: "slot",
        title: "Крупный план",
        file: "public/media/vesper/image-01.webp",
        width: 4,
        height: 5,
        note: "Флакон крупно, без искажения формы.",
      },
      {
        kind: "slot",
        title: "Необычная сцена",
        file: "public/media/vesper/image-02.webp",
        width: 16,
        height: 9,
        note: "Тот же продукт в другой среде.",
      },
      {
        kind: "slot",
        title: "Атмосферная композиция",
        file: "public/media/vesper/image-03.webp",
        width: 4,
        height: 5,
        note: "Свет и настроение серии.",
      },
    ],
    task: "Собрать рекламную серию для вымышленного парфюмерного бренда: один узнаваемый флакон в нескольких сценах.",
    idea: "Тёмный фон, стекло и один тёплый блик. Это рабочая тема для подготовки материалов, а не выполненный заказ.",
    deliverables: [],
    formats: ["Изображения WebP и JPG", "Длинная сторона от 2000 px в оригинале"],
    missing: [
      "public/media/vesper/cover.webp",
      "public/media/vesper/image-01.webp",
      "public/media/vesper/image-02.webp",
      "public/media/vesper/image-03.webp",
      "public/media/vesper/source.webp",
      "public/media/vesper/result.webp",
    ],
    notice:
      "Изображения ещё не созданы. На странице только места под файлы, без чужих работ.",
  },
  {
    id: "vesper-site",
    slug: "vesper-site",
    title: "VESPER. Лендинг",
    category: "web",
    status: "draft",
    isConcept: true,
    summary: "Структура одностраничного сайта для того же концепта. Демосайт ещё не собран.",
    seoDescription:
      "Авторский концепт лендинга VESPER. Рабочего сайта и скриншотов пока нет.",
    cover: { kind: "site" },
    coverRatio: "16 / 10",
    gallery: [
      {
        kind: "slot",
        title: "Главный экран",
        file: "public/media/vesper-site/desktop-01.webp",
        width: 16,
        height: 10,
        note: "Скриншот десктопной версии.",
      },
      {
        kind: "slot",
        title: "Экран продукта",
        file: "public/media/vesper-site/desktop-02.webp",
        width: 16,
        height: 10,
        note: "Второй десктопный экран.",
      },
      {
        kind: "slot",
        title: "Телефон",
        file: "public/media/vesper-site/mobile-01.webp",
        width: 9,
        height: 16,
        note: "Мобильная версия той же страницы.",
      },
    ],
    task: "Собрать одну страницу, где образ, продукт и обращение живут в одном стиле.",
    idea: "Короткий лендинг: первый экран, продукт, серия кадров и контакт. Без каталога и личного кабинета.",
    deliverables: [],
    structure: ["Первый экран", "Продукт", "Серия кадров", "Контакт"],
    formats: ["Скриншоты десктопа и телефона", "Демоссылка появится только у работающего сайта"],
    missing: [
      "public/media/vesper-site/cover.webp",
      "public/media/vesper-site/desktop-01.webp",
      "public/media/vesper-site/desktop-02.webp",
      "public/media/vesper-site/mobile-01.webp",
    ],
    notice:
      "Демосайт не собран. Карточка показывает структуру, а не готовый работающий сайт.",
  },
  {
    id: "vesper",
    slug: "vesper",
    title: "VESPER. Цельный запуск",
    category: "complex",
    status: "draft",
    isConcept: true,
    summary: "Один продукт в трёх форматах. Для этой серии материалы ещё не подготовлены.",
    seoDescription:
      "Авторский концепт комплексного запуска VESPER: визуал, ролик и сайт. Материалы серии готовятся.",
    cover: { kind: "trio" },
    coverRatio: "16 / 9",
    gallery: [],
    task: "Связать рекламное изображение, ролик и лендинг общим характером одного продукта.",
    idea: "Посетитель видит один и тот же флакон в кадре, в движении и на сайте. Пока для VESPER нет ни изображения, ни ролика, ни демосайта.",
    deliverables: [],
    formats: ["Рекламное изображение", "Ролик продукта", "Лендинг"],
    missing: [
      "public/media/vesper/cover.webp",
      "public/media/vesper/video.mp4",
      "public/media/vesper/video-cover.webp",
      "public/media/vesper-site/desktop-01.webp",
    ],
    notice:
      "Вкладки не подменяют отсутствующие материалы другими работами. Снежный ролик — отдельный авторский концепт, не часть VESPER.",
  },
];

const projects: Project[] = SHOW_DRAFTS
  ? [...publishedProjects, ...draftProjects]
  : publishedProjects;

export const categoryLabel: Record<Category, string> = {
  visual: "AI-визуал",
  video: "Видео",
  web: "Сайты",
  complex: "Комплекс",
};

export function isPublished(project: Project): boolean {
  return project.status === "ready" || SHOW_DRAFTS;
}

export function visibleProjects(): Project[] {
  return projects.filter(isPublished);
}

export function findProject(slug: string | undefined): Project | undefined {
  const project = projects.find((item) => item.slug === slug);
  if (!project || !isPublished(project)) return undefined;
  return project;
}

export function nextProject(slug: string): Project | undefined {
  const list = visibleProjects();
  const index = list.findIndex((item) => item.slug === slug);
  if (index < 0 || list.length < 2) return undefined;
  return list[(index + 1) % list.length];
}

export function matchesFilter(project: Project, filter: string): boolean {
  if (filter === "all") return true;
  return project.category === filter;
}
