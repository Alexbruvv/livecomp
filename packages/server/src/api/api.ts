import Elysia from "elysia";

export const api = new Elysia().use(new Elysia({ prefix: "api" }).get("now", () => new Date().toISOString()));

