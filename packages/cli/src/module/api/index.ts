import type { AppRouter } from "@livecomp/server";
import type { Config } from "../config/schema";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

export function createApiClient(serverUrl: string) {
    return createTRPCClient<AppRouter>({
        links: [
            httpBatchLink({
                url: `${serverUrl}/trpc`,
            }),
        ],
    });
}

