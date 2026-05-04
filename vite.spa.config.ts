import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

// Static SPA build for GitHub Pages — no SSR, hash routing.
// Output: dist-spa/  (drop into kalilurrahman.github.io/PhDResearchAssistant/)
export default defineConfig({
  base: "/PhDResearchAssistant/",
  root: path.resolve(__dirname, "spa"),
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist-spa"),
    emptyOutDir: true,
    sourcemap: false,
  },
});
