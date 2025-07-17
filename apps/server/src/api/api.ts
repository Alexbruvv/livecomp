import cors from "@elysiajs/cors";
import Elysia from "elysia";
import { CompetitionClock } from "@livecomp/utils";
import { auth } from "../auth";
import { getFullCompetition } from "../modules/competitions/query";

export const api = new Elysia()
    .use(cors())
    .mount(auth.handler)
    .use(
        new Elysia({ prefix: "api" })
            .get("now", () => new Date().toISOString())
            .get("/:competitionId/live", async ({ params: { competitionId } }) => {
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

