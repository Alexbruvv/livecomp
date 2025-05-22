import { z } from "zod";
import { publicProcedure, restrictedProcedure, router } from "../../trpc/trpc";
import { insertTeamSchema, teams } from "../../db/schema/teams";
import { teamsRepository } from "./teams.repository";
import { and, eq } from "drizzle-orm";
import { manualPointsAdjustmentsRepository } from "../scores/manualPointsAdjustments.repository";
import { manualPointsAdjustments } from "../../db/schema/scores";
import { matchesRepository } from "../matches/matches.repository";
import { matches } from "../../db/schema/matches";

export const teamsRouter = router({
    create: restrictedProcedure("admin")
        .input(z.object({ data: insertTeamSchema }))
        .mutation(async ({ input: { data } }) => {
            return await teamsRepository.create(data);
        }),

    fetchAll: publicProcedure
        .input(
            z
                .object({
                    filters: z
                        .object({
                            competitionId: z.string(),
                        })
                        .partial(),
                })
                .partial()
                .optional()
        )
        .query(async ({ input }) => {
            const conditions = [];

            if (input?.filters?.competitionId) {
                conditions.push(eq(teams.competitionId, input.filters.competitionId));
            }

            return await teamsRepository.findMany({ where: and(...conditions) });
        }),

    fetchById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input: { id } }) => await teamsRepository.findFirst({ where: eq(teams.id, id) })),

    fetchAllScores: publicProcedure
        .input(z.object({ competitionId: z.string() }))
        .query(async ({ input: { competitionId } }) => {
            const selectedTeams = await teamsRepository.findMany({
                where: eq(teams.competitionId, competitionId),
            });

            const scores: Record<string, { leaguePoints: number; gamePoints: number }> = Object.fromEntries(
                selectedTeams.map((teams) => [teams.id, { leaguePoints: 0, gamePoints: 0 }])
            );

            for (const team of selectedTeams) {
                const manualAdjustments = await manualPointsAdjustmentsRepository.findMany({
                    where: eq(manualPointsAdjustments.teamId, team.id),
                });

                for (const adjustment of manualAdjustments) {
                    scores[team.id].leaguePoints += adjustment.leaguePoints;
                }
            }

            const scoredMatches = await matchesRepository.findMany({
                where: eq(matches.competitionId, competitionId),
                with: { scoreEntry: true },
            });

            for (const match of scoredMatches.filter((match) => !!match.scoreEntry)) {
                for (const [teamId, points] of Object.entries(match.scoreEntry!.leaguePoints)) {
                    scores[teamId].leaguePoints += points;
                }

                for (const [teamId, points] of Object.entries(match.scoreEntry!.gamePoints)) {
                    scores[teamId].gamePoints += points;
                }
            }

            return scores;
        }),

    update: restrictedProcedure("admin")
        .input(z.object({ id: z.string(), data: insertTeamSchema.partial() }))
        .mutation(async ({ input: { id, data } }) => {
            return await teamsRepository.update(data, { where: eq(teams.id, id) });
        }),

    delete: restrictedProcedure("admin")
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            return await teamsRepository.delete({ where: eq(teams.id, id) });
        }),
});

