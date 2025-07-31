import cors from "@elysiajs/cors";
import Elysia, { t } from "elysia";
import { CompetitionClock } from "@livecomp/utils";
import { auth } from "../auth";
import { getFullCompetition } from "../modules/competitions/query";
import SuperJSON from "superjson";
import hash from "object-hash";

export const api = new Elysia()
    .use(cors())
    .mount(auth.handler)
    .use(
        new Elysia({ prefix: "api" })
            .get("now", () => new Date().toISOString())
            .get(
                "/competitions/:competitionId",
                async ({ params: { competitionId }, query: { superjson } }) => {
                    const competition = await getFullCompetition(competitionId);
                    if (!competition) return null;

                    const competitionWithHash = {
                        _hash: hash(JSON.parse(JSON.stringify(competition)), {
                            unorderedArrays: true,
                            unorderedSets: true,
                            unorderedObjects: true,
                            respectType: false,
                        }),
                        ...competition,
                    };

                    if (superjson) {
                        return SuperJSON.serialize(competitionWithHash);
                    }

                    return competitionWithHash;
                },
                {
                    query: t.Object({
                        superjson: t.Optional(t.Literal("true")),
                    }),
                }
            )
            .get("/competitions/:competitionId/live", async ({ params: { competitionId } }) => {
                const competition = await getFullCompetition(competitionId);

                if (!competition) return null;

                const competitionClock = new CompetitionClock(competition);
                const nextMatchId = competitionClock.getNextMatchId();
                if (!nextMatchId) return { nextMatch: null };

                const nextMatchTimings = competitionClock.getMatchTimings(nextMatchId);
                if (!nextMatchTimings) return { nextMatch: null };

                const currentMatchId = competitionClock.getCurrentMatchId();
                const currentMatch = competition.matches.find((match) => match.id === currentMatchId);
                const currentMatchTimings = currentMatchId && competitionClock.getMatchTimings(currentMatchId);
                if (currentMatch && currentMatchTimings)
                    return {
                        nextMatch: {
                            matchNumber: currentMatch.sequenceNumber,
                            startsAt: currentMatchTimings.startsAt.toISO(),
                            now: competitionClock.now().toISO(),
                        },
                    };

                const nextMatch = competition.matches.find((match) => match.id === nextMatchId);
                if (!nextMatch) return { nextMatch: null };

                if (competitionClock.isPaused()) return { nextMatch: null };

                return {
                    nextMatch: {
                        matchNumber: nextMatch.sequenceNumber,
                        startsAt: nextMatchTimings.startsAt.toISO(),
                        now: competitionClock.now().toISO(),
                    },
                };
            })
    );

