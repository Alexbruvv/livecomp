import { competitionChecks, CompetitionClock, LeagueRanker, type FullCompetition } from "@livecomp/utils";
import { getFullCompetition } from "../modules/competitions/query";
import { hooks } from "../tasks/hooks";
import { pausesRepository } from "../modules/pauses/pauses.repository";
import { log } from "../utils/log";
import { matchAssignmentsRepository } from "../modules/match-assignments/match-assignments.repository";

export default function setupScoresPublishedListener() {
    hooks.scoresPublished.subscribe(async ({ competitionId }) => {
        const competition = await getFullCompetition(competitionId);
        if (!competition) throw new Error(`Competition with ID ${competitionId} not found`);

        const clock = new CompetitionClock(competition);
        const ranker = new LeagueRanker(competition);

        const allLeagueMatchesFinished = competition.matches
            .filter((match) => match.type === "league")
            .every((match) => clock.getMatchStatus(match.id) === "finished");

        // Seeded assignments
        if (allLeagueMatchesFinished) {
            const seededAssignments = competition.matches
                .reduce(
                    (acc, match) => acc.concat(match.assignments),
                    [] as FullCompetition["matches"][number]["assignments"]
                )
                .filter(
                    (assignment) => !assignment.teamId && assignment.autoConfig && !assignment.autoConfig.targetMatchId
                );

            if (
                seededAssignments.length > 0 &&
                !competitionChecks.find((check) => check.identifier === "no-teams-are-tied")!.check(competition).success
            ) {
                log.error("Teams are tied in the league rankings, pausing competition");
                await pausesRepository.create({
                    competitionId,
                    startsAt: new Date(),
                });
                return;
            }

            const rankEntries = Object.entries(ranker.getRankings());

            if (
                seededAssignments.some(
                    (assignment) => !rankEntries.some((entry) => entry[1] === assignment.autoConfig?.position)
                )
            ) {
                log.error("Not all seeded assignments have a corresponding rank, pausing competition");
                await pausesRepository.create({
                    competitionId,
                    startsAt: new Date(),
                });
                return;
            }

            if (seededAssignments) {
                await Promise.all(
                    seededAssignments.map(async (assignment) => {
                        await matchAssignmentsRepository.update({
                            teamId: rankEntries.find(([, rank]) => rank === assignment.autoConfig!.position)![0],
                        });
                    })
                );
            }
        }
    });
}

