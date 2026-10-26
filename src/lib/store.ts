export type Application = {
  id: string;
  name: string;
  contact: string;
  task: string;
  createdAt: string;
  status: "new" | "done";
};

export type Product = {
  id: string;
  title: string;
  price: string;
  description: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};

const APP_KEY = "npai.applications";
const PRODUCT_KEY = "npai.products";
const AUTH_KEY = "npai.admin";
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
    description: "Регулярное ведение: ролики и посты в едином стиле.",
    visible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "site",
    title: "Сайты и лендинги",
    price: "по запросу",
    description: "Современный лендинг или сайт-резюме под ключ.",
    visible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "full",
    title: "Комплексная упаковка",
    price: "по запросу",
    description: "Фото + видео/анимация + сайт под ключ.",
    visible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeStore(onChange: () => void) {
  const handler = () => onChange();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getApplications(): Application[] {
  return read<Application[]>(APP_KEY, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addApplication(input: Omit<Application, "id" | "createdAt" | "status">) {
  const list = getApplications();
  const item: Application = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "new",
    ...input,
  };
  write(APP_KEY, [item, ...list]);
  return item;
}

export function updateApplication(id: string, patch: Partial<Application>) {
  const list = getApplications().map((item) => (item.id === id ? { ...item, ...patch } : item));
  write(APP_KEY, list);
}

export function deleteApplication(id: string) {
  write(
    APP_KEY,
    getApplications().filter((item) => item.id !== id),
  );
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

/** Change via VITE_ADMIN_PASSWORD in .env if needed. Default for first setup. */
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "npai2026";

export function isAdminAuthed() {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export function loginAdmin(password: string) {
  if (password !== ADMIN_PASSWORD) return false;
  sessionStorage.setItem(AUTH_KEY, "1");
  return true;
}

export function logoutAdmin() {
  sessionStorage.removeItem(AUTH_KEY);
}
