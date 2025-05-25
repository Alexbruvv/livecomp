import { createAuthClient } from "better-auth/react";
import { adminClient, usernameClient } from "better-auth/client/plugins";
import { accessControl, roles } from "@livecomp/shared";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_SERVER_URL,
    plugins: [
        usernameClient(),
        adminClient({
            ac: accessControl,
            roles,
        }),
    ],
});

export const useSession = authClient.useSession;

