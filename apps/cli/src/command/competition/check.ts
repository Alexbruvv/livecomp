import { Command } from "commander";
import { createApiClient } from "../../module/api";
import { loadCliConfig } from "../../module/config";
import { competitionChecks } from "@livecomp/utils";
import chalk from "chalk";
import createCustomAuthClient from "../../module/auth";

export const checkCommand = new Command("check")
    .description("Run checks on the selected competition")
    .action(async () => {
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

        for (const check of competitionChecks) {
            const prefix = `${chalk.blueBright(check.identifier)} (${check.description})`;
            const result = check.check(competition);

            if (result.success) {
                console.log(`${prefix}: ${chalk.greenBright("Passed")}`);
            } else {
                console.log(`${prefix}: ${chalk.red(`Failed. ${result.message}`)}`);
            }
        }
    });

