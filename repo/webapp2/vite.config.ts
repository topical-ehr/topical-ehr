import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/fhir": {
        target: "http://localhost:8080",
        secure: false,
      },
    },
  },
  plugins: [react()],
});
