import { Command } from "commander";
import { createApiClient } from "../../../module/api";
import createCustomAuthClient from "../../../module/auth";
import { loadCliConfig } from "../../../module/config";
import yoctoSpinner from "yocto-spinner";

export const displayMessageCommand = new Command("message")
    .alias("msg")
    .argument("<message>")
    .option("-d, --duration <duration>", "Duration in seconds for the message to be displayed", "20")
    .action(async (message: string, options) => {
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

        const competition = await client.competitions.fetchById.query({
            id: config.config.competition_id,
        });

        if (!competition) {
            console.log("Competition not found. Please check the competition ID in livecomp.toml");
            return;
        }

        const displays = await client.displays.fetchAll.query({
            filters: {
                competitionId: config.config.competition_id,
            },
        });

        const spinner = yoctoSpinner({ text: "Sending message..." }).start();
        await client.displays.showMessage.mutate({
            durationMs: parseInt(options.duration) * 1000,
            message,
            ids: displays.map((display) => display.id),
        });
        spinner.success("Message sent to displays");
    });

