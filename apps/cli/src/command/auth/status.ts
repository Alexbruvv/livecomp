import { Command } from "commander";
import { loadCliConfig } from "../../module/config";
import { createApiClient } from "../../module/api";
import { userConfig } from "../../module/user-config/user-config";

export const authStatusCommand = new Command("status")
    .description("Check the authentication status of the Livecomp CLI")
    .action(async () => {
        const config = await loadCliConfig();
        const token = userConfig.read().tokens[config.instance.server_url];

        if (!token) {
            console.log("Not authenticated. Please log in using 'livecomp auth login'");
            return;
        }

        const client = createApiClient(config.instance.server_url, token);

        try {
            const currentUser = await client.users.fetchCurrent.query();
            console.log(`Authenticated as ${currentUser.username}`);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            console.error(`Failed to fetch current user: ${errorMessage}`);
            return;
        }
    });

