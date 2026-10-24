import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

function publishExtras(mode: string): Plugin {
  return {
    name: "publish-extras",
    apply: "build",
    closeBundle() {
      const dist = path.resolve("dist");
      const index = path.join(dist, "index.html");
      if (fs.existsSync(index)) {
        fs.copyFileSync(index, path.join(dist, "404.html"));
      }
      if (mode !== "drafts") {
        fs.rmSync(path.join(dist, "media", "drafts"), { recursive: true, force: true });
        const mediaDir = path.join(dist, "media");
        if (fs.existsSync(mediaDir) && fs.readdirSync(mediaDir).length === 0) {
          fs.rmdirSync(mediaDir);
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: mode === "gh" || process.env.GITHUB_PAGES === "true" ? "/proekt_NP.AI/" : "/",
  plugins: [react(), publishExtras(mode)],
  server: {
    port: 5173,
    watch: {
      ignored: ["**/public/media/**"],
    },
  },
  preview: {
    port: 4173,
  },
}));
