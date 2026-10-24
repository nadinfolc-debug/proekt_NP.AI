import { useEffect } from "react";

function setMeta(attr: "name" | "property", key: string, value: string) {
  const selector = `meta[${attr}="${key}"]`;
  const node = document.head.querySelector(selector);
  if (node) node.setAttribute("content", value);
}

export function Seo({
  title,
  description,
  jsonLd,
}: {
  title: string;
  description: string;
  jsonLd?: unknown;
}) {
  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);

    const existing = document.getElementById("page-jsonld");
    if (!jsonLd) {
      existing?.remove();
      return;
    }
    const node = existing ?? document.createElement("script");
    node.id = "page-jsonld";
    node.setAttribute("type", "application/ld+json");
    node.textContent = JSON.stringify(jsonLd);
    if (!existing) document.head.appendChild(node);
  }, [title, description, jsonLd]);

  return null;
}
