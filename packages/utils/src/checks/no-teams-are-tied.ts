import { LeagueRanker } from "../league-ranker";
import { check, CheckResult } from "./check";

export const noTeamsAreTiedCheck = check({
    identifier: "no-teams-are-tied",
    description: "No teams are tied in the league rankings",
    check: (competition) => {
        const ranker = new LeagueRanker(competition);
        const rankings = ranker.getRankings();

        const rankCounts = Object.values(rankings).reduce(
            (acc, rank) => {
                acc[rank] = (acc[rank] || 0) + 1;
                return acc;
            },
            {} as Record<number, number>
        );
        const tiedRanks = Object.entries(rankCounts).filter(([_, count]) => count > 1);

        if (tiedRanks.length > 0) {
            return CheckResult.failure(
                "Teams are tied in the league rankings: " +
                    tiedRanks.map(([rank, count]) => `${count} teams at rank ${rank}`).join(", ")
            );
        }

        return CheckResult.success();
    },
});

