import { check, CheckResult } from "./check";

export const allTeamsHaveLeagueMatchCheck = check({
    identifier: "all-teams-have-league-match",
    description: "All teams have a league match",
    check: (competition) => {
        const teamsWithoutLeagueMatch = competition.teams.filter((team) =>
            competition.matches.every((match) => !match.assignments.some((assignment) => assignment.teamId === team.id))
        );

        if (teamsWithoutLeagueMatch.length > 0) {
            return CheckResult.failure(
                "Teams without league match: " + teamsWithoutLeagueMatch.map((team) => team.shortName).join(", ")
            );
        }

        return CheckResult.success();
    },
});

