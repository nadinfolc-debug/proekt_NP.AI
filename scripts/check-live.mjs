const url = process.argv[2] || "https://nadinfolc-debug-proekt-np-ai-1df5.twc1.net/";
const response = await fetch(url, { redirect: "follow" });
const html = await response.text();
console.log("status", response.status, "final", response.url, "len", html.length);
console.log(html.slice(0, 1200));
console.log("\n-- refs --");
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  console.log(match[1]);
}
