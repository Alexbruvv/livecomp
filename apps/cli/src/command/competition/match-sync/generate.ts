import { Command } from "commander";
import { createApiClient } from "../../../module/api";
import createCustomAuthClient from "../../../module/auth";
import { loadCliConfig } from "../../../module/config";
import type { MatchFileData } from "../../../module/match-sync/schema";
import fs from "fs/promises";
import { MATCH_FILE_PATH } from "../../../constants";
import { stringify } from "yaml";

const MATCH_EXPR = /^\d+(\|\d+)*$/;

export const matchSyncGenerateCommand = new Command("generate")
    .description("Generate a match file from a generic schedule")
    .argument("<scheduleFile>", "Path to the schedule file")
    .action(async (scheduleFile: string) => {
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

        const file = Bun.file(scheduleFile);
        if (!(await file.exists())) {
            console.log(`Schedule file not found: ${scheduleFile}`);
            return;
        }

        const content = await file.text();
        const lines = content
            .split(/\r?\n/)
            .map((line) => (line.split("#")[0] ?? "").trim().replaceAll(" ", ""))
            .filter((line) => line !== "");

        if (lines.some((line) => !MATCH_EXPR.test(line))) {
            console.log(
                "Invalid match format in the schedule file. Each line should be in the format '1|2|3|4|5|6|7|8' (adjusted for the number of teams)"
            );
            console.log("Comments can be added using '#' at the end of the line. Whitespace is ignored");
            return;
        }

        const matches = lines.map((line) => line.split("|").map((team) => parseInt(team)));

        if (matches.some((match) => match.length > competition.game.startingZones.length)) {
            console.log(
                `Invalid match format in the schedule file. Each match can have at most ${competition.game.startingZones.length} teams.`
            );
            return;
        }

        const teams = competition.teams
            .map((team) => ({ team, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ team }) => team);

        const generatedSchedule: MatchFileData = {
            matches: matches.map((match, index) => ({
                name: `Match ${index}`,
                sequenceNumber: index,
                type: "league",
                assignments: Object.fromEntries(
                    match.map((teamIdx, zoneIdx) => [
                        competition.game.startingZones[zoneIdx]!.name,
                        teams[teamIdx]!.shortName,
                    ])
                ),
            })),
        };

        await fs.writeFile(MATCH_FILE_PATH, stringify(generatedSchedule, { indent: 4, uniqueKeys: true }));
        console.log(`Match file generated: ${MATCH_FILE_PATH}`);
    });

