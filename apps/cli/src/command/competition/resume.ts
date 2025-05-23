import { Command } from "commander";
import { createApiClient } from "../../module/api";
import { loadCliConfig } from "../../module/config";
import { userConfig } from "../../module/user-config/user-config";

export const resumeCommand = new Command("resume")
    .alias("unpause")
    .description("Resume the selected competition")
    .action(async () => {
        const config = await loadCliConfig();
        const token = userConfig.read().tokens[config.instance.server_url];

        if (!token) {
            console.log("Not authenticated. Please log in using 'livecomp auth login'");
            return;
        }

        const client = createApiClient(config.instance.server_url, token);

        if (!config.config.competition_id) {
            console.log("No competition ID found in the configuration. Please set it in livecomp.toml");
            return;
        }

        await client.competitions.unpause.mutate({
            id: config.config.competition_id,
        });

        console.log("Competition resumed successfully");
    });

