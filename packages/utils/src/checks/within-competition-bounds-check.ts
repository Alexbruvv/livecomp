import { check, CheckResult } from "./check";

export const withinCompetitionBoundsCheck = check({
    identifier: "within-competition-bounds",
    description: "All match periods are within the competition bounds",
    check: (competition) => {
        const failingMatchPeriods = competition.matchPeriods.filter(
            (matchPeriod) => matchPeriod.startsAt < competition.startsAt || matchPeriod.endsAt > competition.endsAt
        );

        if (failingMatchPeriods.length > 0) {
            CheckResult.failure(
                `The following match periods are outside the competition bounds: ${failingMatchPeriods
                    .map((matchPeriod) => `${matchPeriod.startsAt.toISOString()} - ${matchPeriod.endsAt.toISOString()}`)
                    .join(", ")}`
            );
        }

        return CheckResult.success();
    },
});

