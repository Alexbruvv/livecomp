import type { CacheInvalidationEvent } from "@livecomp/server/src/trpc/stream";
import { api } from "../../../utils/trpc";

export default function StreamConsumer() {
    const utils = api.useUtils();

    api.stream.onInvalidate.useSubscription(undefined, {
        onData: async (data) => {
            const typedData = data as CacheInvalidationEvent;

            // @ts-expect-error Figuring out the types here is tricky, but it is strongly typed on the server
            utils[typedData.routerName][typedData.methodName].invalidate(typedData.input).catch(console.log);
        },
    });

    return <></>;
}

