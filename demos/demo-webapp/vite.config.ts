import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dsv from "@rollup/plugin-dsv";

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            // src: path.resolve(__dirname, "./src"),
        },
    },
    server: {
        proxy: {
            "/fhir": {
                target: "http://localhost:5454",
                secure: false,
            },
            "/db_snapshots": {
                target: "http://0.0.0.0:8000",
                secure: false,
            },
        },

        headers: {
            // For OPFS
            // from https://github.com/tomayac/sqlite-wasm#usage-with-vite
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
    },
    preview: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
    },
    build: {
        minify: false,
    },
    optimizeDeps: {
        // from https://github.com/tomayac/sqlite-wasm#usage-with-vite
        exclude: ["@sqlite.org/sqlite-wasm"],
    },
    plugins: [react(), dsv()],
});
