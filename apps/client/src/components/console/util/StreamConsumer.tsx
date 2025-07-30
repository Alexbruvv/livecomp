import type { CacheInvalidationEvent } from "@livecomp/server/src/trpc/stream";
import { api } from "../../../utils/trpc";

export default function StreamConsumer() {
    const utils = api.useUtils();

    api.stream.onInvalidate.useSubscription(undefined, {
        onData: async (data) => {
            const typedData = data as CacheInvalidationEvent;

            // Ignore competition updates; they are handled in the competition patch task
            if (typedData.routerName === "competitions" && typedData.methodName === "fetchById") {
                return;
            }

            // @ts-expect-error Figuring out the types here is tricky, but it is strongly typed on the server
            utils[typedData.routerName][typedData.methodName].invalidate(typedData.input).catch(console.log);
        },
    });

    return <></>;
}

