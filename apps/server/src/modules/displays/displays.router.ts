import { z } from "zod";
import { displays, insertDisplaySchema } from "../../db/schema/displays";
import { publicProcedure, restrictedProcedure, router } from "../../trpc/trpc";
import { displaysRepository } from "./displays.repository";
import { and, eq } from "drizzle-orm";
import EventEmitter, { on } from "events";
import type { DisplayMessage } from "./messages";
import { competitionsRepository } from "../competitions/competitions.repository";
import { TRPCError } from "@trpc/server";
import { competitions } from "../../db/schema/competitions";
import { drizzleClient } from "../../db/db";

type DisplayEvent = {
    target: "*" | string[];
    message: DisplayMessage;
};

export function emitDisplayMessage(target: "*" | string[], message: DisplayMessage) {
    streamEmitter.emit("stream", { target, message } satisfies DisplayEvent);
}

const streamEmitter = new EventEmitter();
streamEmitter.setMaxListeners(0);

export const displaysRouter = router({
    pair: publicProcedure
        .input(z.object({ competitionId: z.string() }))
        .mutation(async ({ input: { competitionId } }) => {
            const competition = await competitionsRepository.findFirst({ where: eq(competitions.id, competitionId) });

            if (!competition) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Competition not found" });
            }

            if (!competition.acceptingNewDisplays) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Competition is not accepting new displays" });
            }

            let identifier: string | null = null;
            let attempts = 0;

            while (
                !identifier ||
                ((await displaysRepository.findFirst({ where: eq(displays.identifier, identifier) })) && attempts < 5)
            ) {
                identifier = Math.random().toString(36).substring(2, 8);
                attempts++;
            }

            if (!identifier) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate identifier" });
            }

            const display = await displaysRepository.create({
                competitionId,
                identifier,
                name: "Untitled Display",
            });

            return display;
        }),

    fetchAll: publicProcedure
        .input(
            z
                .object({ filters: z.object({ competitionId: z.string() }).partial().optional() })
                .partial()
                .optional()
        )
        .query(async ({ input }) => {
            const filters = [];

            if (input?.filters?.competitionId) {
                filters.push(eq(displays.competitionId, input.filters.competitionId));
            }

            return await displaysRepository.findMany({ where: and(...filters) });
        }),

    fetchById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input: { id } }) => {
        return await displaysRepository.findFirst({ where: eq(displays.id, id) });
    }),

    fetchByIdentifier: publicProcedure
        .input(z.object({ competitionId: z.string(), identifier: z.string() }))
        .query(async ({ input: { competitionId, identifier } }) => {
            return await displaysRepository.findFirst({
                where: and(eq(displays.identifier, identifier), eq(displays.competitionId, competitionId)),
            });
        }),

    update: restrictedProcedure({ competition: ["control"] })
        .input(z.object({ id: z.string(), data: insertDisplaySchema.partial() }))
        .mutation(async ({ input: { id, data } }) => {
            return await displaysRepository.update(data, { where: eq(displays.id, id) });
        }),

    heartbeat: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input: { id } }) => {
        // Bypass repository to avoid sending a stream update
        await drizzleClient.update(displays).set({ lastHeartbeat: new Date() }).where(eq(displays.id, id));
    }),

    refresh: restrictedProcedure({ competition: ["control"] })
        .input(z.object({ ids: z.array(z.string()) }))
        .mutation(async ({ input: { ids } }) => {
            emitDisplayMessage(ids, { type: "refresh" });
        }),

    showMessage: restrictedProcedure({ competition: ["control"] })
        .input(
            z.object({
                ids: z.array(z.string()),
                message: z.string(),
                durationMs: z.number(),
            })
        )
        .mutation(async ({ input: { ids, message, durationMs } }) => {
            emitDisplayMessage(ids, { type: "showText", text: message, durationMs });
        }),

    delete: restrictedProcedure({ competition: ["control"] })
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            return await displaysRepository.delete({ where: eq(displays.id, id) });
        }),

    onStreamMessage: publicProcedure.input(z.object({ id: z.string() })).subscription(async function* ({
        signal,
        input: { id },
    }) {
        try {
            await displaysRepository.update({ online: true }, { where: eq(displays.id, id) });

            for await (const [data] of on(streamEmitter, "stream", { signal })) {
                const typedData = data as DisplayEvent;

                if (typedData.target === "*" || typedData.target.includes(id)) {
                    yield typedData.message;
                }
            }
        } finally {
            await displaysRepository.update({ online: false }, { where: eq(displays.id, id) });
        }
    }),
});

