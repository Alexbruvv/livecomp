import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { publicProcedure, restrictedProcedure, router } from "../../trpc/trpc";
import { insertShepherdSchema, shepherds } from "../../db/schema/venues";
import { shepherdsRepository } from "./shepherds.repository";

export const shepherdsRouter = router({
    create: restrictedProcedure("admin")
        .input(z.object({ data: insertShepherdSchema }))
        .mutation(async ({ input: { data } }) => {
            return await shepherdsRepository.create(data);
        }),

    fetchAll: publicProcedure
        .input(
            z
                .object({
                    filters: z
                        .object({
                            venueId: z.string(),
                        })
                        .partial(),
                })
                .partial()
                .optional()
        )
        .query(async ({ input }) => {
            const conditions = [];

            if (input?.filters?.venueId) {
                conditions.push(eq(shepherds.venueId, input.filters.venueId));
            }

            return await shepherdsRepository.findMany({ where: and(...conditions) });
        }),

    fetchById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input: { id } }) => await shepherdsRepository.findFirst({ where: eq(shepherds.id, id) })),

    update: restrictedProcedure("admin")
        .input(z.object({ id: z.string(), data: insertShepherdSchema.partial() }))
        .mutation(async ({ input: { id, data } }) => {
            return await shepherdsRepository.update(data, { where: eq(shepherds.id, id) });
        }),

    delete: restrictedProcedure("admin")
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            return await shepherdsRepository.delete({ where: eq(shepherds.id, id) });
        }),
});

