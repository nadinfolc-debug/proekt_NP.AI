/** Public asset path with Vite `base` (GitHub Pages subpath-safe). */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
