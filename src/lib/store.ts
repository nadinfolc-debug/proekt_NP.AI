export type Product = {
  id: string;
  title: string;
  price: string;
  description: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};

const PRODUCT_KEY = "npai.products";
const APP_KEY = "npai.applications";
const EVENT = "npai-store";

const defaultProducts: Product[] = [
  {
    id: "starter",
    title: "Стартовый визуал",
    price: "по запросу",
    description: "Генерация фото (от 5 штук) + видеоролик.",
    visible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "social",
    title: "Контент для соцсетей",
    price: "по запросу",
    description: "Регулярный контент: ролики и посты в едином стиле.",
    visible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "site",
    title: "Сайты и лендинги",
    price: "по запросу",
    description: "Сайт или лендинг под задачу и стиль бренда.",
    visible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function emit() {
  window.dispatchEvent(new Event(EVENT));
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}

/** Clear legacy browser-side application storage (PD must not live in localStorage). */
try {
  localStorage.removeItem(APP_KEY);
} catch {
  // ignore
}

export function subscribeStore(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function getProducts(): Product[] {
  const list = read<Product[] | null>(PRODUCT_KEY, null);
  if (!list || list.length === 0) {
    write(PRODUCT_KEY, defaultProducts);
    return defaultProducts;
  }
  return list.sort((a, b) => a.title.localeCompare(b.title, "ru"));
}

export function getVisibleProducts(): Product[] {
  return getProducts().filter((item) => item.visible);
}

export function saveProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
  const list = getProducts();
  const now = new Date().toISOString();
  if (product.id) {
    write(
      PRODUCT_KEY,
      list.map((item) =>
        item.id === product.id
          ? {
              ...item,
              title: product.title,
              price: product.price,
              description: product.description,
              visible: product.visible,
              updatedAt: now,
            }
          : item,
      ),
    );
    return product.id;
  }
  const id = crypto.randomUUID();
  write(PRODUCT_KEY, [
    ...list,
    {
      id,
      title: product.title,
      price: product.price,
      description: product.description,
      visible: product.visible,
      createdAt: now,
      updatedAt: now,
    },
  ]);
  return id;
}

export function deleteProduct(id: string) {
  write(
    PRODUCT_KEY,
    getProducts().filter((item) => item.id !== id),
  );
}
