declare module "bun" {
    interface Env {
        DATABASE_URL: string;
        CLIENT_BASE_URL: string;

        ACCESS_TOKEN_SECRET: string;
    }
}

