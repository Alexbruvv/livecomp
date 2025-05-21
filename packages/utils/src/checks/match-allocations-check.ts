import { check, CheckResult } from "./check";

export const matchAllocationsCheck = check({
    identifier: "match-allocations",
    description: "All matches have the required team allocations",
    check: (competition) => {
        const failingMatches = competition.matches.filter(
            (match) => match.assignments.length < competition.game.startingZones.length
        );

        if (failingMatches.length > 0) {
            return CheckResult.failure(
                `The following matches have fewer assignments than the number of starting zones: ${failingMatches
                    .map((match) => match.id)
                    .join(", ")}`
            );
        }

        return CheckResult.success();
    },
});

