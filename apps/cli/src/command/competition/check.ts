import { Command } from "commander";
import { createApiClient } from "../../module/api";
import { loadCliConfig } from "../../module/config";
import { competitionChecks } from "@livecomp/utils";
import createCustomAuthClient from "../../module/auth";
import { TablePrinter } from "../../util/table-printer";

export const checkCommand = new Command("check")
    .description("Run checks on the selected competition")
    .argument("[check]", "Optional identifier of specific check to run")
    .action(async (checkId: string | undefined) => {
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

        if (checkId) {
            const check = competitionChecks.find((c) => c.identifier === checkId.toLowerCase());
            if (!check) {
                console.log(`Check with ID '${checkId}' not found.`);
                return;
            }

            const result = check.check(competition);
            console.log(`Check ID: ${check.identifier}`);
            console.log(`Description: ${check.description}`);
            console.log(`Passed: ${result.success ? "Yes" : "No"}`);
            if (!result.success) {
                console.log(`Message: ${result.message}`);
            }

            return;
        }

        const tablePrinter = new TablePrinter<{
            identifier: string;
            description: string;
            passed: string;
            message: string;
        }>({
            identifier: {
                header: "ID",
            },
            description: {
                header: "Description",
            },
            passed: {
                header: "Passed",
            },
            message: {
                header: "Message",
            },
        });

        for (const check of competitionChecks) {
            const result = check.check(competition);

            tablePrinter.addRow({
                identifier: check.identifier,
                description: check.description.length > 50 ? `${check.description.slice(0, 50)}...` : check.description,
                passed: result.success ? "Yes" : "No",
                message: result.success ? "" : result.message,
            });
        }

        tablePrinter.print();

        console.log("\nTo get the full description of a specific check, use 'livecomp comp check <check_id>'");
    });

