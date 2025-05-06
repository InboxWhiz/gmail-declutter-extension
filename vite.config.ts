import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");
const publicDir = resolve(__dirname, "public");

// https://vite.dev/config/
export default defineConfig({
  root,
  publicDir: publicDir,
  plugins: [react()],
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        sidebar: resolve(root, "sidebar", "index.html"),
        popup: resolve(root, "popup", "index.html"),
        tutorial: resolve(root, "tutorial", "index.html"),
      },
    },
  },
});
