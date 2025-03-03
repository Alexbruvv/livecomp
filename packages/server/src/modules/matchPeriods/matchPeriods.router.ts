import { z } from "zod";
import { publicProcedure, restrictedProcedure, router } from "../../trpc/trpc";
import { insertMatchPeriodSchema, matchPeriods } from "../../db/schema/matches";
import { matchPeriodsRepository } from "./matchPeriods.repository";
import { and, asc, eq } from "drizzle-orm";

export const matchPeriodsRouter = router({
    create: restrictedProcedure("admin")
        .input(z.object({ data: insertMatchPeriodSchema }))
        .mutation(async ({ input: { data } }) => {
            return await matchPeriodsRepository.create(data);
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
                conditions.push(eq(matchPeriods.competitionId, input.filters.competitionId));
            }

            return await matchPeriodsRepository.findMany({
                where: and(...conditions),
                orderBy: asc(matchPeriods.startsAt),
            });
        }),

    fetchById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input: { id } }) => {
        return await matchPeriodsRepository.findFirst({
            where: eq(matchPeriods.id, id),
        });
    }),

    update: restrictedProcedure("admin")
        .input(
            z.object({
                id: z.string(),
                data: insertMatchPeriodSchema.partial(),
            })
        )
        .mutation(async ({ input: { id, data } }) => {
            return await matchPeriodsRepository.update(data, { where: eq(matchPeriods.id, id) });
        }),

    delete: restrictedProcedure("admin")
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            return await matchPeriodsRepository.delete({ where: eq(matchPeriods.id, id) });
        }),
});

