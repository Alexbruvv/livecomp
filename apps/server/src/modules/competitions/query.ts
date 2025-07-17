import { asc, eq } from "drizzle-orm";
import { matches, matchPeriods } from "../../db/schema/matches";
import type { FindFirstOpts, FindFirstQueryConfig } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { competitionsRepository } from "./competitions.repository";
import { competitions } from "../../db/schema/competitions";

export const fullCompetitionQuery = {
    teams: true,
    venue: true,
    game: {
        with: {
            startingZones: true,
        },
    },
    matches: {
        with: {
            assignments: {
                with: {
                    team: true,
                    autoConfig: true,
                },
            },
            scoreEntry: true,
        },
        orderBy: asc(matches.sequenceNumber),
    },
    matchPeriods: {
        orderBy: asc(matchPeriods.startsAt),
    },
    pauses: true,
} satisfies FindFirstOpts<FindFirstQueryConfig<AppSchema, "competitions">>["with"];

export async function getFullCompetition(id: string) {
    return await competitionsRepository.findFirst({
        where: eq(competitions.id, id),
        with: fullCompetitionQuery,
    });
}

