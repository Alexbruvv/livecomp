import { z } from "zod";
import { restrictedProcedure, router } from "../../trpc/trpc";
import { matchesRepository } from "../matches/matches.repository";
import { eq } from "drizzle-orm";
import { matches } from "../../db/schema/matches";
import { matchScoreEntries } from "../../db/schema/scores";
import { TRPCError } from "@trpc/server";
import { matchScoreEntriesRepository } from "./match-score-entries.repository";

const tinCanRallyValidator = z.object({
    teams: z.array(
        z.object({
            teamId: z.string(),
            present: z.boolean(),
            disqualified: z.boolean(),
            actions: z.string().regex(/^[CIX]*$/, "Invalid actions format"),
        })
    ),
});

const nuclearCleanupValidator = z.object({
    teams: z.array(
        z.object({
            teamId: z.string(),
            present: z.boolean(),
            leftStartingZone: z.boolean(),
        })
    ),
    zoneTokenCounts: z.object({
        outerWest: z.number(),
        innerWest: z.number(),
        innerEast: z.number(),
        outerEast: z.number(),
    }),
});

export const scoresRouter = router({
    submitTinCanRallyScores: restrictedProcedure({ competition: ["control"] })
        .input(z.object({ matchId: z.string(), data: tinCanRallyValidator }))
        .mutation(async ({ input: { matchId, data } }) => {
            const match = await matchesRepository.findFirst({
                where: eq(matches.id, matchId),
                with: { scoreEntry: true },
            });

            if (!match) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Match not found" });
            }

            const gamePoints = Object.fromEntries(
                data.teams.map((team) => {
                    let lineDeficit = 0;
                    let accumulatedScore = 0;
                    let touchedCan = false;
                    let linesCrossed = 0;

                    for (const action of team.actions) {
                        if (action === "C") {
                            touchedCan = true;
                        } else if (action === "X") {
                            lineDeficit++;
                        } else if (action === "I") {
                            if (lineDeficit > 0) {
                                lineDeficit--;
                            } else {
                                accumulatedScore += 2;

                                if (!touchedCan && linesCrossed !== 0) {
                                    accumulatedScore++;
                                }

                                linesCrossed++;
                                touchedCan = false;
                            }
                        }
                    }

                    return [team.teamId, accumulatedScore];
                })
            );

            const leaguePoints = Object.fromEntries(
                Object.entries(gamePoints)
                    .sort((a, b) => a[1] - b[1])
                    .map(([teamId], idx) => [
                        teamId,
                        data.teams.find((team) => team.teamId === teamId)?.present ? 2 * idx + 2 : 0,
                    ])
            );

            if (!match.scoreEntry) {
                await matchScoreEntriesRepository.create({
                    matchId: match.id,
                    scoreData: data,
                    gamePoints,
                    leaguePoints,
                });
            } else {
                await matchScoreEntriesRepository.update(
                    {
                        scoreData: data,
                        gamePoints,
                        leaguePoints,
                    },
                    {
                        where: eq(matchScoreEntries.matchId, match.id),
                    }
                );
            }
        }),

    submitNuclearCleanupScores: restrictedProcedure({ competition: ["control"] })
        .input(z.object({ matchId: z.string(), data: nuclearCleanupValidator }))
        .mutation(async ({ input: { matchId, data } }) => {
            const match = await matchesRepository.findFirst({
                where: eq(matches.id, matchId),
                with: { scoreEntry: true },
            });

            if (!match) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Match not found" });
            }

            const gamePoints = Object.fromEntries(
                data.teams.map((team, idx) => [
                    team.teamId,
                    0 +
                        (team.leftStartingZone ? 1 : 0) +
                        (idx === 0
                            ? 3 * data.zoneTokenCounts.outerEast + data.zoneTokenCounts.innerEast
                            : 3 * data.zoneTokenCounts.outerWest + data.zoneTokenCounts.innerWest),
                ])
            );

            const leaguePoints = Object.fromEntries(
                Object.entries(gamePoints)
                    .sort((a, b) => a[1] - b[1])
                    .map(([teamId], idx) => [
                        teamId,
                        data.teams.find((team) => team.teamId === teamId)?.present ? 2 * idx + 2 : 0,
                    ])
            );

            if (!match.scoreEntry) {
                await matchScoreEntriesRepository.create({
                    matchId: match.id,
                    scoreData: data,
                    gamePoints,
                    leaguePoints,
                });
            } else {
                await matchScoreEntriesRepository.update(
                    {
                        scoreData: data,
                        gamePoints,
                        leaguePoints,
                    },
                    {
                        where: eq(matchScoreEntries.matchId, match.id),
                    }
                );
            }
        }),
});

