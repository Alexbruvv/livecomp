import EventEmitter, { on } from "events";
import type { AppRouter } from "../server";
import { router, publicProcedure } from "./trpc";
import type { inferRouterInputs } from "@trpc/server";
import { type Role } from "../db/schema/auth";

const streamEmitter = new EventEmitter();
streamEmitter.setMaxListeners(0);

type RouterInput = inferRouterInputs<AppRouter>;

export type CacheInvalidationEvent<
    R extends keyof RouterInput = keyof RouterInput,
    M extends keyof RouterInput[R] = keyof RouterInput[R],
> = {
    routerName: R;
    methodName: M;
    input?: RouterInput[R][M];
    minimumRole?: Role;
};

function broadcastInvalidateMessage<R extends keyof RouterInput, M extends keyof RouterInput[R]>(
    routerName: R,
    methodName: M,
    input?: RouterInput[R][M]
) {
    streamEmitter.emit("invalidate", { routerName, methodName, input });
}

export const streamRouter = router({
    onInvalidate: publicProcedure.subscription(async function* ({ signal }) {
        for await (const [data] of on(streamEmitter, "invalidate", { signal })) {
            yield data;
        }
    }),
});

export const stream = {
    broadcastInvalidateMessage,
};

