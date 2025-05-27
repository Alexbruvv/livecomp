import { Command } from "commander";
import { createApiClient } from "../../module/api";
import { loadCliConfig } from "../../module/config";
import createCustomAuthClient from "../../module/auth";

export const pauseCommand = new Command("pause").description("Pause the selected competition").action(async () => {
    const config = await loadCliConfig();
    const authClient = createCustomAuthClient({ baseUrl: config.instance.server_url });
    const { data } = await authClient.getSession();

    if (!data?.session) {
        console.log("Not authenticated. Please log in using 'livecomp auth login'");
        return;
    }

    const client = createApiClient(config.instance.server_url, data.session.token);

    if (!config.config.competition_id) {
        console.log("No competition ID found in the configuration. Please set it in livecomp.toml");
        return;
    }

    await client.competitions.pause.mutate({
        id: config.config.competition_id,
    });

    console.log("Competition paused successfully");
});

