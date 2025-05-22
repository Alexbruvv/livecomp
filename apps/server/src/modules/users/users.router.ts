import { z } from "zod";
import { usersRepository } from "./users.repository";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { insertUserSchema, userPasswords, users } from "../../db/schema/auth";
import { router, restrictedProcedure, protectedProcedure } from "../../trpc/trpc";

function generatePassword() {
    return Math.random().toString(36).slice(-10);
}

export const usersRouter = router({
    create: restrictedProcedure("sysadmin")
        .input(z.object({ data: insertUserSchema }))
        .mutation(async ({ ctx, input }) => {
            const user = await usersRepository.create(input.data);

            if (!user) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
            }

            const password = generatePassword();

            await ctx.db.insert(userPasswords).values({
                passwordHash: await Bun.password.hash(password),
                userId: user.id,
            });

            return {
                user,
                password,
            };
        }),

    fetchAll: restrictedProcedure("sysadmin").query(async () => await usersRepository.findMany()),

    fetchById: restrictedProcedure("sysadmin")
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => await usersRepository.findFirst({ where: eq(users.id, input.id) })),

    fetchCurrent: protectedProcedure.query(({ ctx }) => ctx.user),

    update: restrictedProcedure("sysadmin")
        .input(z.object({ id: z.string(), data: insertUserSchema.partial() }))
        .mutation(async ({ input }) => {
            return await usersRepository.update(input.data, { where: eq(users.id, input.id) });
        }),

    delete: restrictedProcedure("sysadmin")
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            return await usersRepository.delete({ where: eq(users.id, input.id) });
        }),
});

