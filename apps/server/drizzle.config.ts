import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./drizzle",
    schema: ["./src/db/schema", "./auth-schema.ts"],
    dialect: "postgresql",
    dbCredentials: {
        url: Bun.env.DATABASE_URL,
    },
    casing: "snake_case",
});

