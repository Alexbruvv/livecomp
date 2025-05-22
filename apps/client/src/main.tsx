import { createRoot } from "react-dom/client";

import "@cloudscape-design/global-styles/index.css";
import App from "./App.tsx";
import { api, queryClient, trpcClient } from "./utils/trpc.ts";

createRoot(document.getElementById("root")!).render(
    <api.Provider client={trpcClient} queryClient={queryClient}>
        <App />
    </api.Provider>
);

