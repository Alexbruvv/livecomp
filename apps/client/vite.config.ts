import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "tailwindcss";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        TanStackRouterVite(),
        react(),
        nodePolyfills({
            include: ["crypto", "stream", "util", "vm"],
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

