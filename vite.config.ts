import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");
const publicDir = resolve(__dirname, "public");

// https://vite.dev/config/
export default defineConfig({
  root,
  publicDir: publicDir,
  plugins: [
    react(),
    {
      name: "strip-presentation-apps",
      closeBundle() {
        const baseDir = path.join(outDir, "presentation", "apps");
        if (!fs.existsSync(baseDir)) return;

        // Move every subfolder of presentation/apps to dist root
        const apps = fs.readdirSync(baseDir);
        for (const app of apps) {
          const from = path.join(baseDir, app);
          const to = path.join(outDir, app);

          // Remove existing target if necessary
          if (fs.existsSync(to))
            fs.rmSync(to, { recursive: true, force: true });
          fs.renameSync(from, to);
        }

        // Remove now-empty parent folders
        fs.rmSync(path.join(outDir, "presentation"), {
          recursive: true,
          force: true,
        });
      },
    },
  ],
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        sidebar: resolve(root, "presentation/apps/sidebar/index.html"),
        popup: resolve(root, "presentation/apps/popup/index.html"),
        tutorial: resolve(root, "presentation/apps/tutorial/index.html"),
        content_script: resolve(root, "data/content_scripts/content.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "content_script") {
            return "[name].js";
          }
          return "assets/[name].js";
        },
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
