import { betterAuth } from "better-auth";
import { admin, openAPI, username } from "better-auth/plugins";
import { accessControl, roles } from "@livecomp/shared";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzleClient } from "./db/db";

export const auth = betterAuth({
    logger: console,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    trustedOrigins: [import.meta.env.CLIENT_BASE_URL],
    database: drizzleAdapter(drizzleClient, {
        provider: "pg",
        usePlural: true,
    }),
    plugins: [
        openAPI(),
        username(),
        admin({
            ac: accessControl,
            roles,
        }),
    ],
});

