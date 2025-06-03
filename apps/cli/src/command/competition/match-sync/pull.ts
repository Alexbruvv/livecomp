import { Command } from "commander";
import { createApiClient } from "../../../module/api";
import createCustomAuthClient from "../../../module/auth";
import { loadCliConfig } from "../../../module/config";
import fs from "fs/promises";
import { stringify } from "yaml";
import { MATCH_FILE_PATH } from "../../../constants";
import { type MatchFileSchema } from "../../../module/match-sync/schema";

export const matchSyncPullCommnad = new Command("pull").action(async () => {
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

    const matches = competition.matches.map(
        (match) =>
            ({
                name: match.name,
                type: match.type,
                sequenceNumber: match.sequenceNumber,
                assignments: Object.fromEntries(
                    competition.game.startingZones.map((zone) => {
                        const assignment = match.assignments.find((a) => a.startingZoneId === zone.id);

                        const zoneName = parseInt(zone.name) ?? zone.name;

                        if (assignment) {
                            if (assignment.team) {
                                return [zoneName, assignment.team.shortName];
                            } else if (assignment.autoConfig) {
                                return [
                                    zoneName,
                                    {
                                        targetSequenceNumber: competition.matches.find(
                                            (m) => m.id === assignment.autoConfig!.targetMatchId
                                        )?.sequenceNumber,
                                        position: assignment.autoConfig.position,
                                    },
                                ];
                            }
                        }

                        return [zoneName, null];
                    })
                ),
            }) satisfies MatchFileSchema["matches"][number]
    );

    await fs.writeFile(MATCH_FILE_PATH, stringify({ matches }, { indent: 4, uniqueKeys: true }));
    console.log(`Match file generated: ${MATCH_FILE_PATH}`);
});

