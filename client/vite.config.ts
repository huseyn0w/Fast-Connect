/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Bind-mounted source on Docker/macOS doesn't always emit FS events;
    // enable polling there via VITE_USE_POLLING=true (kept off for native dev).
    watch:
      process.env.VITE_USE_POLLING === "true"
        ? { usePolling: true, interval: 100 }
        : undefined,
  },
  preview: {
    port: 4173,
    host: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
