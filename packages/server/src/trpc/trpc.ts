import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { drizzleClient } from "../db/db";
import { SuperJSON } from "superjson";
import * as jose from "jose";
import { auth } from "../modules/auth/auth.module";
import { eq } from "drizzle-orm";
import { users } from "../db/schema/auth";

export async function createTrpcContext({ req }: FetchCreateContextFnOptions) {
    if (req.headers.has("authorization")) {
        const token = req.headers.get("authorization")!;

        const { payload } = await jose.jwtVerify(token, auth.encodedSecret, {
            issuer: "livecomp:server",
            audience: "livecomp:client",
        });

        const userId = payload.userId;

        if (userId) {
            const user = await drizzleClient.query.users.findFirst({
                where: eq(users.id, userId as string),
            });

            if (user) {
                return {
                    db: drizzleClient,
                    user,
                };
            }
        }
    }

    return {
        db: drizzleClient,
    };
}

type Context = Awaited<ReturnType<typeof createTrpcContext>>;

const t = initTRPC.context<Context>().create({
    transformer: SuperJSON,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    return next({
        ctx: {
            ...ctx,
            user: ctx.user,
        },
    });
});

