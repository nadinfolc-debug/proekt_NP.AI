import { asset } from "../lib/asset";

export type VideoWork = {
  id: string;
  src: string;
  poster: string;
  posterWebp: string;
  series: string;
  title: string;
  description: string;
};

const root = asset("media/videos");

export const videoWorks: VideoWork[] = [
  {
    id: "cosmetic",
    src: `${root}/cosmetic.mp4`,
    poster: `${root}/cosmetic-poster.jpg`,
    posterWebp: `${root}/cosmetic-poster.webp`,
    series: "Косметика",
    title: "Цвет в движении",
    description:
      "Короткий ролик, где помада и жест остаются в одном ритме. Подходит для Reels, Stories и первого экрана запуска.",
  },
  {
    id: "accessory",
    src: `${root}/accessory.mp4`,
    poster: `${root}/accessory-poster.jpg`,
    posterWebp: `${root}/accessory-poster.webp`,
    series: "Аксессуары",
    title: "Предмет крупно",
    description:
      "Очки или деталь аксессуара в динамике. Кадр держит форму предмета и свет, без лишнего сюжета вокруг.",
  },
  {
    id: "lifestyle",
    src: `${root}/lifestyle.mp4`,
    poster: `${root}/lifestyle-poster.jpg`,
    posterWebp: `${root}/lifestyle-poster.webp`,
    series: "Lifestyle",
    title: "Продукт в жизни",
    description:
      "Сцена, где вещь уже на человеке и в городе. Ролик показывает характер носки, а не только витринный план.",
  },
  {
    id: "styling",
    src: `${root}/styling.mp4`,
    poster: `${root}/styling-poster.jpg`,
    posterWebp: `${root}/styling-poster.webp`,
    series: "Стилизация",
    title: "Образ целиком",
    description:
      "Свет, фактура и движение собраны в один стиль. Такой ролик задаёт настроение серии до отдельного продукта.",
  },
];
