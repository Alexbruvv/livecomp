declare module "bun" {
    interface Env {
        DATABASE_URL: string;

        ACCESS_TOKEN_SECRET: string;
        REFRESH_TOKEN_SECRET: string;
    }
}
