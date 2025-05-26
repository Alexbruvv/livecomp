import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { drizzleClient } from "../db/db";
import { SuperJSON } from "superjson";
import { auth } from "../auth";

export async function createTrpcContext({ req }: FetchCreateContextFnOptions) {
    const session = await auth.api.getSession({ headers: req.headers });

    return {
        db: drizzleClient,
        session,
    };
}

type Context = Awaited<ReturnType<typeof createTrpcContext>>;

const t = initTRPC.context<Context>().create({
    transformer: SuperJSON,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    if (
        !(
            await auth.api.userHasPermission({
                body: {
                    userId: ctx.session.user.id,
                    permissions: {
                        system: ["login"],
                    },
                },
            })
        ).success
    ) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    return next({
        ctx,
    });
});

export const restrictedProcedure = (
    permissions: Parameters<(typeof auth)["api"]["userHasPermission"]>[0]["body"]["permissions"]
) =>
    protectedProcedure.use(async ({ ctx, next }) => {
        if (
            !(
                await auth.api.userHasPermission({
                    body: { userId: ctx.session?.user.id, permissions: permissions as any },
                })
            ).success
        ) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Forbidden" });
        }

        return next({
            ctx,
        });
    });

