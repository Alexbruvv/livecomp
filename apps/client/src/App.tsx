import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/trpc";
import StreamConsumer from "./components/console/util/StreamConsumer";
import { createRouter } from "@tanstack/react-router";

import { I18nProvider } from "@cloudscape-design/components/i18n";
import enGbMessages from "@cloudscape-design/components/i18n/messages/all.en-GB";

import { routeTree } from "./routeTree.gen";
import { RouterProvider } from "@tanstack/react-router";
import { Provider } from "jotai";
import { store } from "./state/store";
import { CookiesProvider } from "react-cookie";

const router = createRouter({
    routeTree,
    context: {
        title: "Livecomp",
    },
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

export default function App() {
    return (
        <Provider store={store}>
            <CookiesProvider>
                <QueryClientProvider client={queryClient}>
                    <StreamConsumer />

                    <I18nProvider locale="en-GB" messages={[enGbMessages]}>
                        <RouterProvider router={router} />
                    </I18nProvider>
                </QueryClientProvider>
            </CookiesProvider>
        </Provider>
    );
}

