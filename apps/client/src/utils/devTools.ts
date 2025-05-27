export default function areDevToolsEnabled() {
    return import.meta.env.VITE_DEV_TOOLS === "true";
}

