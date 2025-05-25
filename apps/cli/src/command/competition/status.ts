import { Command } from "commander";
import { createApiClient } from "../../module/api";
import { loadCliConfig } from "../../module/config";
import { CompetitionClock } from "@livecomp/utils";
import chalk from "chalk";
import createCustomAuthClient from "../../module/auth";

export const competitionStatusCommand = new Command("status")
    .description("Check the status of the selected competition")
    .action(async () => {
        const config = await loadCliConfig();
        const authClient = createCustomAuthClient({ baseUrl: config.instance.server_url });
        const { data } = await authClient.getSession();

        if (!data?.session) {
            console.log("Not authenticated. Please log in using 'livecomp auth login'");
            return;
        }

        if (!config.config.competition_id) {
            console.log("No competition ID found in the configuration. Please set it in livecomp.toml");
            return;
        }

        const client = createApiClient(config.instance.server_url, data.session.token);
        const competition = await client.competitions.fetchById.query({
            id: config.config.competition_id,
        });

        if (!competition) {
            console.log("Competition not found. Please check the competition ID in livecomp.toml");
            return;
        }

        const competitionClock = new CompetitionClock(competition);
        const statusString = competitionClock.isPaused() ? chalk.red("Paused") : chalk.green("Running");

        console.log(`${competition.name} (${competition.shortName})`);
        console.log(`Status: ${statusString}`);
    });

