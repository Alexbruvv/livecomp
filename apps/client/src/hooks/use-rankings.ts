import { useMemo } from "react";
import { FullCompetition, LeagueRanker } from "@livecomp/utils";

export default function useRankings<T extends FullCompetition | null | undefined>(
    competition: T
): T extends undefined ? Record<string, number> | undefined : Record<string, number> {
    return useMemo(() => {
        if (!competition) {
            return undefined;
        }

        return new LeagueRanker(competition).getRankings();
    }, [competition]) as T extends undefined ? Record<string, number> | undefined : Record<string, number>;
}

