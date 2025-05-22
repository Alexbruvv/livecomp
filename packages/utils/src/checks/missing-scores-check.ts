import { check, CheckResult } from "./check";

export const missingScoresCheck = check({
    identifier: "missing-scores",
    description: "All matches with scored matches before and after have been scored",
    check: ({ matches }) => {
        const failingMatches = matches
            .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
            .filter(
                (match) =>
                    !match.scoreEntry &&
                    matches.filter((m) => m.sequenceNumber < match.sequenceNumber).some((m) => m.scoreEntry) &&
                    matches.filter((m) => m.sequenceNumber > match.sequenceNumber).some((m) => m.scoreEntry)
            );

        if (failingMatches.length > 0) {
            return CheckResult.failure(
                "Matches without scores: " +
                    failingMatches.map((match) => `${match.name} (${match.sequenceNumber})`).join(", ")
            );
        }

        return CheckResult.success();
    },
});

