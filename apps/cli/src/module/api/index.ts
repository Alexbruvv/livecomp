import type { AppRouter } from "@livecomp/server";
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
                        authorization: `Bearer ${authToken}`,
                    };
                },
            }),
        ],
    });
}

