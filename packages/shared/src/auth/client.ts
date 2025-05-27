import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { accessControl, roles } from "@livecomp/shared";

type AuthClientOptions = Parameters<typeof createAuthClient>[0];

export const authClientOptions = {
    baseURL: import.meta.env.VITE_SERVER_URL,
    plugins: [
        adminClient({
            ac: accessControl,
            roles,
        }),
    ],
} as const satisfies AuthClientOptions;

export const authClient = createAuthClient({
    ...authClientOptions,
});

export const useSession = authClient.useSession;

export type Session = (typeof authClient.$Infer.Session)["session"];
export type User = (typeof authClient.$Infer.Session)["user"];

