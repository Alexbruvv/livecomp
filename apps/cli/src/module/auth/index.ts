import { createAuthClient } from "better-auth/client";
import { userConfig } from "../user-config/user-config";
import { authClientOptions } from "@livecomp/shared";

export default function createCustomAuthClient({ baseUrl }: { baseUrl: string }) {
    const userCfg = userConfig.read();

    return createAuthClient({
        ...authClientOptions,
        baseURL: baseUrl,

        fetchOptions: {
            auth: {
                type: "Bearer",
                token: userCfg.tokens[baseUrl] ?? "",
            },
        },
    });
}

