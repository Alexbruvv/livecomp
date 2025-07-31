import EventEmitter, { on } from "events";
import type { AppRouter } from "../server";
import { router, publicProcedure } from "./trpc";
import type { inferRouterInputs } from "@trpc/server";
import { z } from "zod";
import type { IChange } from "json-diff-ts";

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
};

export type CompetitionDiffEvent = {
    competitionId: string;
    hash: string;
    diff: IChange[];
};

function broadcastInvalidateMessage<R extends keyof RouterInput, M extends keyof RouterInput[R]>(
    routerName: R,
    methodName: M,
    input?: RouterInput[R][M]
) {
    streamEmitter.emit("invalidate", { routerName, methodName, input } satisfies CacheInvalidationEvent<R, M>);
}

function broadcastCompetitionDiff(competitionId: string, hash: string, diff: IChange[]) {
    streamEmitter.emit("competitionDiff", { competitionId, hash, diff } satisfies CompetitionDiffEvent);
}

export const streamRouter = router({
    onInvalidate: publicProcedure.subscription(async function* ({ signal }) {
        for await (const [data] of on(streamEmitter, "invalidate", { signal })) {
            yield data;
        }
    }),

    competitionDiffs: publicProcedure.input(z.object({ competitionId: z.string() })).subscription(async function* ({
        input,
        signal,
    }) {
        const { competitionId } = input;
        for await (const [data] of on(streamEmitter, "competitionDiff", { signal })) {
            const typedData = data as CompetitionDiffEvent;

            if (typedData.competitionId === competitionId) {
                yield data;
            }
        }
    }),
});

export const stream = {
    streamEmitter,

    broadcastInvalidateMessage,
    broadcastCompetitionDiff,
};

