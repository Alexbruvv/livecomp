import { check, CheckResult } from "./check";

export const matchPeriodOverlapsCheck = check({
    identifier: "match-period-overlaps",
    description: "No two match periods overlap",
    check: (competition) => {
        const overlappingPairs = [];

        for (const matchPeriod of competition.matchPeriods) {
            for (const otherMatchPeriod of competition.matchPeriods.filter((mp) => mp !== matchPeriod)) {
                if (
                    (matchPeriod.startsAt >= otherMatchPeriod.endsAt &&
                        matchPeriod.startsAt < otherMatchPeriod.endsAt) ||
                    (otherMatchPeriod.startsAt >= matchPeriod.startsAt &&
                        otherMatchPeriod.startsAt < matchPeriod.endsAt)
                ) {
                    overlappingPairs.push([matchPeriod, otherMatchPeriod]);
                }
            }
        }

        const uniqueOverlappingPairs = overlappingPairs.filter(
            (pair, index, self) =>
                index ===
                self.findIndex((p) => {
                    return (p[0] === pair[0] && p[1] === pair[1]) || (p[0] === pair[1] && p[1] === pair[0]);
                })
        );

        if (uniqueOverlappingPairs.length > 0) {
            return CheckResult.failure(
                "Match periods overlap: " +
                    uniqueOverlappingPairs.map((pair) => `${pair[0].name} and ${pair[1].name}`).join(", ")
            );
        }

        return CheckResult.success();
    },
});

