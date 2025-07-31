import type { FullCompetition } from "@livecomp/utils";
import { drizzleClient } from "../db/db";
import { competitions } from "../db/schema/competitions";
import { stream, type CacheInvalidationEvent } from "../trpc/stream";
import { getFullCompetition } from "../modules/competitions/query";
import hash from "object-hash";
import { diff } from "json-diff-ts";

export default async function startPatchCompetitionTask() {
    const competitionIds = (
        await drizzleClient
            .select({
                id: competitions.id,
            })
            .from(competitions)
    ).map((c) => c.id);

    const cachedCompetitions = new Map<string, FullCompetition>();

    for (const competitionId of competitionIds) {
        const competition = await getFullCompetition(competitionId);

        if (competition) {
            cachedCompetitions.set(competitionId, competition);
        }
    }

    stream.streamEmitter.on("invalidate", async (event: CacheInvalidationEvent<"competitions", "fetchById">) => {
        if (event.routerName === "competitions" && event.methodName === "fetchById") {
            const competitionId = event.input?.id;

            if (competitionId && cachedCompetitions.has(competitionId)) {
                const previousState = cachedCompetitions.get(competitionId)!;
                const nextState = await getFullCompetition(competitionId);

                if (nextState === null) {
                    cachedCompetitions.delete(competitionId);
                    return;
                }

                const compDiff = diff(previousState, nextState, {
                    treatTypeChangeAsReplace: false,
                });
                const compHash = hash(JSON.parse(JSON.stringify(nextState)), {
                    unorderedArrays: true,
                    unorderedSets: true,
                    unorderedObjects: true,
                    respectType: false,
                });
                cachedCompetitions.set(competitionId, nextState);

                stream.broadcastCompetitionDiff(competitionId, compHash, compDiff);
            } else {
                for (const [competitionId, previousState] of cachedCompetitions.entries()) {
                    const nextState = await getFullCompetition(competitionId);

                    if (nextState === null) {
                        cachedCompetitions.delete(competitionId);
                        continue;
                    }

                    const compDiff = diff(previousState, nextState, {
                        treatTypeChangeAsReplace: false,
                    });
                    const compHash = hash(JSON.parse(JSON.stringify(nextState)), {
                        unorderedArrays: true,
                        unorderedSets: true,
                        unorderedObjects: true,
                        respectType: false,
                    });
                    cachedCompetitions.set(competitionId, nextState);

                    stream.broadcastCompetitionDiff(competitionId, compHash, compDiff);
                }
            }
        }
    });
}

