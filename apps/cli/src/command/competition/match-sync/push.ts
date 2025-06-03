import { Command } from "commander";
import { createApiClient } from "../../../module/api";
import createCustomAuthClient from "../../../module/auth";
import { loadCliConfig } from "../../../module/config";
import { MATCH_FILE_PATH } from "../../../constants";
import { loadConfig } from "zod-config";
import { matchFileSchema } from "../../../module/match-sync/schema";
import { yamlAdapter } from "zod-config/yaml-adapter";
import inquirer from "inquirer";
import yoctoSpinner from "yocto-spinner";
import type { AppRouterInput } from "@livecomp/server";

export const matchSyncPushCommand = new Command("push")
    .description("Push local match configuration to the server")
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

        const { matches } = await loadConfig({
            schema: matchFileSchema,
            adapters: yamlAdapter({
                path: MATCH_FILE_PATH,
            }),
        });

        const invalidSequenceNumberMatches = matches.filter((match, idx) => match.sequenceNumber !== idx);
        if (invalidSequenceNumberMatches.length > 0) {
            console.log("Invalid sequence numbers found in matches:");
            invalidSequenceNumberMatches.forEach((match) => {
                console.log(`- ${match.name} (expected: ${matches.indexOf(match)}, got: ${match.sequenceNumber})`);
            });
            return;
        }

        const scoredMatches = competition.matches.filter((match) => match.scoreEntry !== null);
        const maxScoredSequenceNumber = Math.max(...scoredMatches.map((match) => match.sequenceNumber), -1);

        const matchesToPush = matches.filter((match) => match.sequenceNumber > maxScoredSequenceNumber);

        if (matchesToPush.length < matches.length) {
            console.log(`Found ${matchesToPush.length} matches to push out of ${matches.length} total matches.`);
            console.log(`Pushing from sequence number ${maxScoredSequenceNumber + 1} onwards.`);
            console.log("Matches will not overwrite existing matches with scores.");
            const { confirmPush } = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "confirmPush",
                    message: "Do you want to proceed with pushing these matches?",
                },
            ]);

            if (!confirmPush) {
                console.log("Push cancelled.");
                return;
            }
        }

        let spinner = yoctoSpinner({ text: "Deleting future matches..." }).start();

        await Promise.all(
            competition.matches
                .filter((match) => match.sequenceNumber > maxScoredSequenceNumber)
                .map((match) =>
                    client.matches.delete.mutate({
                        id: match.id,
                    })
                )
        );

        spinner.success("Deleted future matches");

        spinner = yoctoSpinner({ text: "Pushing new matches..." }).start();

        await Promise.all(
            matchesToPush.map(async (match) => {
                const createdMatch = await client.matches.create.mutate({
                    data: {
                        name: match.name,
                        type: match.type,
                        competitionId: competition.id,
                        sequenceNumber: match.sequenceNumber,
                    },
                });

                if (!createdMatch) {
                    console.error(`Failed to create match: ${match.name}`);
                    return;
                }

                await client.matches.updateAssignments.mutate({
                    id: createdMatch.id,
                    assignments: Object.fromEntries(
                        Object.entries(match.assignments).map(([zoneName, assignment]) => [
                            competition.game.startingZones.find((zone) => zone.name === zoneName)?.id ?? zoneName,
                            {
                                type: "team",
                                teamId:
                                    competition.teams.find((team) => team.shortName === assignment)?.id ?? assignment,
                            } satisfies AppRouterInput["matches"]["updateAssignments"]["assignments"][string],
                        ])
                    ),
                });
            })
        );

        spinner.success("Pushed new matches");
    });

