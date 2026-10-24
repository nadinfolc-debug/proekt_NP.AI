import { photoWorks } from "./photoWorks";
import { videoWorks } from "./videoWorks";

export type PortfolioKind = "photo" | "video";

export type PortfolioWork = {
  id: string;
  kind: PortfolioKind;
  series: string;
  title: string;
  description: string;
  /** Image or poster shown in the fan */
  cover: string;
  coverWebp?: string;
  /** Video file when kind is video */
  videoSrc?: string;
  alt?: string;
};

const photos: PortfolioWork[] = photoWorks.map((item) => ({
  id: `photo-${item.id}`,
  kind: "photo",
  series: item.series,
  title: item.title,
  description: item.description,
  cover: item.src,
  alt: item.alt,
}));

const videos: PortfolioWork[] = videoWorks.map((item) => ({
  id: `video-${item.id}`,
  kind: "video",
  series: item.series,
  title: item.title,
  description: item.description,
  cover: item.poster,
  coverWebp: item.posterWebp,
  videoSrc: item.src,
}));

/** Photos and videos in one deck: related video follows its series when possible. */
export const portfolioWorks: PortfolioWork[] = (() => {
  const bySeries = new Map<string, PortfolioWork[]>();
  for (const item of [...photos, ...videos]) {
    const list = bySeries.get(item.series) ?? [];
    list.push(item);
    bySeries.set(item.series, list);
  }

  const order = [
    "Косметика",
    "Ресторан",
    "Кухонная техника",
    "Интерьер",
    "Аксессуары",
    "Напиток",
    "Lifestyle",
    "Стилизация",
  ];

  const result: PortfolioWork[] = [];
  for (const series of order) {
    const group = bySeries.get(series);
    if (!group) continue;
    const photoItems = group.filter((item) => item.kind === "photo");
    const videoItems = group.filter((item) => item.kind === "video");
    result.push(...photoItems, ...videoItems);
    bySeries.delete(series);
  }
  for (const leftover of bySeries.values()) {
    result.push(...leftover);
  }
  return result;
})();

export function filterPortfolio(
  items: readonly PortfolioWork[],
  kind: "all" | PortfolioKind,
): PortfolioWork[] {
  if (kind === "all") return [...items];
  return items.filter((item) => item.kind === kind);
}
