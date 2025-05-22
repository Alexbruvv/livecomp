/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SERVER_URL: string;
    readonly VITE_WS_URL: string;

    readonly VITE_DEV_TOOLS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

