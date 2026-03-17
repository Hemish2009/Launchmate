// vite.config.js  (replace your existing one)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Makes /launchmate reload without 404 in dev
    historyApiFallback: true,
  },
});