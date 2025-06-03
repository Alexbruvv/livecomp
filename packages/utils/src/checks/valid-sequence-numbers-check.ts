import { check, CheckResult } from "./check";

export const validSequenceNumbersCheck = check({
    identifier: "valid-sequence-numbers",
    description: "Sequence numbers are consecutive and the first is 0",
    check: ({ matches }) => {
        const sortedMatches = matches.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
        const expectedSequenceNumbers = Array.from({ length: sortedMatches.length }, (_, i) => i);
        const invalidMatches = sortedMatches.filter(
            (match, index) => match.sequenceNumber !== expectedSequenceNumbers[index]
        );

        if (invalidMatches.length > 0) {
            return CheckResult.failure(
                "Matches with invalid sequence numbers: " +
                    invalidMatches.map((match) => `${match.name} (${match.sequenceNumber})`).join(", ")
            );
        }

        return CheckResult.success();
    },
});

