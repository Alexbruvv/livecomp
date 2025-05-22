import { useMemo } from "react";
import { CompetitionClock } from "@livecomp/utils";
import { AppRouterOutput } from "@livecomp/server";

export default function useCompetitionClock<T extends AppRouterOutput["competitions"]["fetchById"] | undefined>(
    competition: T
): T extends undefined ? CompetitionClock | undefined : CompetitionClock {
    return useMemo(() => {
        if (!competition) {
            return undefined;
        }

        return new CompetitionClock(competition);
    }, [competition]) as T extends undefined ? CompetitionClock | undefined : CompetitionClock;
}

