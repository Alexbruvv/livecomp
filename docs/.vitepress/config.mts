import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Livecomp",
    description: "A software stack for operating robotics competitions",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: "Home", link: "/" },
            { text: "Docs", link: "/administration/deployment" },
        ],

        sidebar: [
            {
                text: "Administration",
                items: [{ text: "Deployment", link: "/administration/deployment" }],
            },
        ],

        socialLinks: [{ icon: "github", link: "https://github.com/Alexbruvv/livecomp" }],
    },
});

