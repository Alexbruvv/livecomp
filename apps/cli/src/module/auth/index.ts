import { createAuthClient } from "better-auth/client";
import { userConfig } from "../user-config/user-config";
import { usernameClient } from "better-auth/client/plugins";

export default function createCustomAuthClient({ baseUrl }: { baseUrl: string }) {
    const userCfg = userConfig.read();

    return createAuthClient({
        baseURL: baseUrl,
        plugins: [usernameClient()],

        fetchOptions: {
            auth: {
                type: "Bearer",
                token: userCfg.tokens[baseUrl] ?? "",
            },
        },
    });
}

