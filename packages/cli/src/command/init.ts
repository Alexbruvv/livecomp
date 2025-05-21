import { Command } from "commander";
import yoctoSpinner from "yocto-spinner";
import { config } from "../module/config";
import { createApiClient } from "../module/api";
import inquirer from "inquirer";

export const initCommand = new Command("init")
    .description("Initialises a new Livecomp configuration in the current directory")
    .argument("<server-url>", "The URL of the Livecomp server")
    .action(async (serverUrl: string) => {
        const client = createApiClient(serverUrl);

        let selectedCompetitionId: string | undefined = undefined;

        try {
            const competitions = await client.competitions.fetchAll.query();

            if (competitions.length > 0) {
                const answers = await inquirer.prompt([
                    {
                        type: "list",
                        name: "competitionId",
                        message: "Select a competition to use in this configuration:",
                        choices: competitions.map((competition) => ({
                            name: competition.name,
                            value: competition.id,
                        })),
                    },
                ]);

                selectedCompetitionId = answers.competitionId;
            } else {
                console.log("No competitions found. Please create a new competition using the Livecomp web interface.");
                return;
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            console.error(`Failed to fetch competitions: ${errorMessage}`);
            return;
        }

        const spinner = yoctoSpinner({ text: "Saving default configuration..." }).start();
        try {
            await config.saveDefaultConfig({ serverUrl, competitionId: selectedCompetitionId });
            spinner.success("Default configuration saved");
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            spinner.error(`Failed to save default configuration: ${errorMessage}`);
        }
    });

