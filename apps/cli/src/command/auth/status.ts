import { Command } from "commander";
import { loadCliConfig } from "../../module/config";
import createCustomAuthClient from "../../module/auth";

export const authStatusCommand = new Command("status")
    .description("Check the authentication status of the Livecomp CLI")
    .action(async () => {
        const config = await loadCliConfig();

        const authClient = createCustomAuthClient({ baseUrl: config.instance.server_url });
        const { data } = await authClient.getSession();

        if (!data?.session) {
            console.log("Not authenticated. Please log in using 'livecomp auth login'");
            return;
        }

        try {
            console.log(`Authenticated as ${data?.user.name} (${data?.user.username})`);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            console.error(`Failed to fetch current user: ${errorMessage}`);
            return;
        }
    });

