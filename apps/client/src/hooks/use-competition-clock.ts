import { useMemo } from "react";
import { CompetitionClock, FullCompetition } from "@livecomp/utils";

export default function useCompetitionClock<T extends FullCompetition | null | undefined>(
    competition: T
): T extends undefined ? CompetitionClock | undefined : CompetitionClock {
    return useMemo(() => {
        if (!competition) {
            return undefined;
        }

        return new CompetitionClock(competition);
    }, [competition]) as T extends undefined ? CompetitionClock | undefined : CompetitionClock;
}

