import type { ImageMedia } from "./projects";

export type ComparePair = {
  before: ImageMedia;
  after: ImageMedia;
};

/**
 * Пара «исходный продукт / рекламная сцена».
 * Оставляйте null, пока нет двух сопоставимых кадров одного товара
 * с одинаковым соотношением сторон.
 * Когда файлы готовы, заполните объект — на главной появится сравнение.
 */
export const comparePair: ComparePair | null = null;
