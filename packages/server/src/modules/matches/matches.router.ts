import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { insertMatchSchema, matches } from "../../db/schema/matches";
import { publicProcedure, restrictedProcedure, router } from "../../trpc/trpc";
import { matchesRepository } from "./matches.repository";

export const matchesRouter = router({
    create: restrictedProcedure("admin")
        .input(z.object({ data: insertMatchSchema }))
        .mutation(async ({ input: { data } }) => {
            return await matchesRepository.create(data);
        }),

    fetchAll: publicProcedure
        .input(
            z
                .object({
                    filters: z
                        .object({
                            matchPeriodId: z.string(),
                            teamId: z.string(),
                        })
                        .partial(),
                })
                .partial()
                .optional()
        )
        .query(async ({ input }) => {
            const conditions = [];

            if (input?.filters?.matchPeriodId) {
                conditions.push(eq(matches.matchPeriodId, input.filters.matchPeriodId));
            }

            let fetchedMatches = await matchesRepository.findMany({
                where: and(...conditions),
                with: {
                    assignments: {
                        with: {
                            team: true,
                        },
                    },
                },
            });

            if (input?.filters?.teamId) {
                fetchedMatches = fetchedMatches.filter((match) =>
                    match.assignments.some((assignment) => assignment.teamId === input!.filters!.teamId)
                );
            }

            return fetchedMatches;
        }),

    fetchById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input: { id } }) => {
        return await matchesRepository.findFirst({
            where: eq(matches.id, id),
            with: { assignments: { with: { team: true } } },
        });
    }),

    update: restrictedProcedure("admin")
        .input(
            z.object({
                id: z.string(),
                data: insertMatchSchema.partial(),
            })
        )
        .mutation(async ({ input: { id, data } }) => {
            return await matchesRepository.update(data, { where: eq(matches.id, id) });
        }),

    delete: restrictedProcedure("admin")
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            return await matchesRepository.delete({ where: eq(matches.id, id) });
        }),
});

