import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "tailwindcss";

const ReactCompilerConfig = {};

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        TanStackRouterVite(),
        react({
            babel: {
                plugins: ["babel-plugin-react-compiler", ReactCompilerConfig],
            },
        }),
    ],
    css: {
        postcss: {
            plugins: [tailwindcss()],
        },
    },
    build: {
        chunkSizeWarningLimit: 3000,
    },
});

