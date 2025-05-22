import { z } from "zod";
import { publicProcedure, restrictedProcedure, router } from "../../trpc/trpc";
import { insertStartingZoneSchema, startingZones } from "../../db/schema/games";
import { and, eq } from "drizzle-orm";
import { startingZonesRepository } from "./startingZones.repository";

export const startingZonesRouter = router({
    create: restrictedProcedure("admin")
        .input(z.object({ data: insertStartingZoneSchema }))
        .mutation(async ({ input: { data } }) => {
            return await startingZonesRepository.create(data);
        }),

    fetchAll: publicProcedure
        .input(
            z
                .object({
                    filters: z
                        .object({
                            gameId: z.string(),
                        })
                        .partial(),
                })
                .partial()
                .optional()
        )
        .query(async ({ input }) => {
            const conditions = [];

            if (input?.filters?.gameId) {
                conditions.push(eq(startingZones.gameId, input.filters.gameId));
            }

            return await startingZonesRepository.findMany({ where: and(...conditions) });
        }),

    fetchById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input: { id } }) => {
        return await startingZonesRepository.findFirst({ where: eq(startingZones.id, id) });
    }),

    update: restrictedProcedure("admin")
        .input(z.object({ id: z.string(), data: insertStartingZoneSchema.partial() }))
        .mutation(async ({ input: { id, data } }) => {
            return await startingZonesRepository.update(data, { where: eq(startingZones.id, id) });
        }),

    delete: restrictedProcedure("admin")
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            return await startingZonesRepository.delete({ where: eq(startingZones.id, id) });
        }),
});

