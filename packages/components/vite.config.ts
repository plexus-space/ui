import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  assetsInclude: ["**/*.wgsl"],
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib/index.ts"),
      name: "PlexusUI",
      fileName: (format) => `plexus-ui.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ["@webgpu/types"],
  },
});
