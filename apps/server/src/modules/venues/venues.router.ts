import { z } from "zod";
import { publicProcedure, restrictedProcedure, router } from "../../trpc/trpc";
import { insertVenueSchema, venues } from "../../db/schema/venues";
import { venuesRepository } from "./venues.repository";
import { eq } from "drizzle-orm";

export const venuesRouter = router({
    create: restrictedProcedure("admin")
        .input(z.object({ data: insertVenueSchema }))
        .mutation(async ({ input: { data } }) => {
            return await venuesRepository.create(data);
        }),

    fetchAll: publicProcedure.query(async () => {
        return await venuesRepository.findMany();
    }),

    fetchById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input: { id } }) => await venuesRepository.findFirst({ where: eq(venues.id, id) })),

    update: restrictedProcedure("admin")
        .input(z.object({ id: z.string(), data: insertVenueSchema.partial() }))
        .mutation(async ({ input: { id, data } }) => {
            return await venuesRepository.update(data, { where: eq(venues.id, id) });
        }),

    delete: restrictedProcedure("admin")
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            return await venuesRepository.delete({ where: eq(venues.id, id) });
        }),
});

