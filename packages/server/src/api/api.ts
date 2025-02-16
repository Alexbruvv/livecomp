import cors from "@elysiajs/cors";
import Elysia from "elysia";

export const api = new Elysia()
    .use(cors())
    .use(new Elysia({ prefix: "api" }).get("now", () => new Date().toISOString()));

