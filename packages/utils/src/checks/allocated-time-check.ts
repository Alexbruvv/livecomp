import { CompetitionClock } from "..";
import { check, CheckResult } from "./check";

export const allocatedTimeCheck = check({
    identifier: "allocated-time",
    description: "All matches are able to be scheduled",
    check: (competition) => {
        const competitionClock = new CompetitionClock(competition);

        const unscheduledMatches = competitionClock.getUnscheduledMatches();

        if (unscheduledMatches.length > 0) {
            return CheckResult.failure(
                `There are ${unscheduledMatches.length} unscheduled matches: ${unscheduledMatches
                    .map((match) => match.name)
                    .join(", ")}`
            );
        }

        return CheckResult.success();
    },
});

