import type { AppRouter } from "../../../../server/src/server";
import type { Config } from "../config/schema";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

export function createApiClient(serverUrl: string, authToken?: string | null) {
    return createTRPCClient<AppRouter>({
        links: [
            httpBatchLink({
                url: `${serverUrl}/trpc`,
                transformer: SuperJSON,
                headers() {
                    if (!authToken) return {};

                    return {
                        authorization: authToken,
                    };
                },
            }),
        ],
    });
}

