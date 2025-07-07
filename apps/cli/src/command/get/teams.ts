import { Command } from "commander";
import { createApiClient } from "../../module/api";
import { loadCliConfig } from "../../module/config";
import createCustomAuthClient from "../../module/auth";
import { TablePrinter } from "../../util/table-printer";

export const getTeamsCommand = new Command("teams")
    .description("List teams in the competition")
    .alias("team")
    .alias("t")
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

        const teams = await client.teams.fetchAll.query({
            filters: { competitionId: config.config.competition_id },
        });

        const scores = await client.teams.fetchAllScores.query({
            competitionId: config.config.competition_id,
        });

        const teamData = teams.map((team) => ({
            shortName: team.shortName,
            name: team.name,
            leaguePoints: scores[team.id]?.leaguePoints ?? 0,
            gamePoints: scores[team.id]?.gamePoints ?? 0,
        }));

        const tablePrinter = new TablePrinter<(typeof teamData)[0]>({
            shortName: {
                header: "Short name",
            },
            name: {
                header: "Name",
            },
            leaguePoints: {
                header: "League points",
            },
            gamePoints: {
                header: "Game points",
            },
        });

        teamData.forEach((team) => tablePrinter.addRow(team));

        tablePrinter.print();
    });

