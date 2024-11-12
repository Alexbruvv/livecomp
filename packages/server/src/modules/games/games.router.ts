import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../trpc/trpc";
import { games, insertGameSchema } from "../../db/schema/games";
import { eq } from "drizzle-orm";
import { gamesRepository } from "./games.repository";

export const gamesRouter = router({
    create: protectedProcedure.input(z.object({ data: insertGameSchema })).mutation(async ({ input: { data } }) => {
        return await gamesRepository.create(data);
    }),

    fetchAll: publicProcedure.query(async () => {
        return await gamesRepository.findMany();
    }),

    fetchById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input: { id } }) => {
        return await gamesRepository.findFirst({ where: eq(games.id, id) });
    }),

    update: protectedProcedure
        .input(z.object({ id: z.string(), data: insertGameSchema.partial() }))
        .mutation(async ({ input: { id, data } }) => {
            return await gamesRepository.update(data, { where: eq(games.id, id) });
        }),

    delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input: { id } }) => {
        return await gamesRepository.delete({ where: eq(games.id, id) });
    }),
});

