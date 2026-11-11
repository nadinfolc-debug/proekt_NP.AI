import fs from "node:fs";

for (const file of ["docs/index.html", "docs/404.html"]) {
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, "utf8");
  html = html
    .replace(/\s*<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com"\s*\/?>/g, "")
    .replace(/\s*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com"[^>]*>/g, "")
    .replace(/\s*<link[^>]*fonts\.googleapis\.com\/css2[^>]*>/g, "");
  fs.writeFileSync(file, html);
  console.log("cleaned", file);
}
