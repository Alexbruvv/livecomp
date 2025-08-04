import { z } from "zod";
import { insertManualPointsAdjustmentSchema, manualPointsAdjustments } from "../../db/schema/scores";
import { restrictedProcedure, router } from "../../trpc/trpc";
import { pointsAdjustmentsRepository } from "./points-adjustments.repository";
import { eq } from "drizzle-orm";

export const pointsAdjustmentsRouter = router({
    create: restrictedProcedure({ competition: ["score"] })
        .input(
            z.object({
                data: insertManualPointsAdjustmentSchema,
            })
        )
        .mutation(async ({ input: { data } }) => {
            return await pointsAdjustmentsRepository.create(data);
        }),

    update: restrictedProcedure({ competition: ["score"] })
        .input(
            z.object({
                id: z.string(),
                data: insertManualPointsAdjustmentSchema.partial(),
            })
        )
        .mutation(async ({ input: { id, data } }) => {
            return await pointsAdjustmentsRepository.update(data, {
                where: eq(manualPointsAdjustments.id, id),
            });
        }),

    delete: restrictedProcedure({ competition: ["score"] })
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            return await pointsAdjustmentsRepository.delete({
                where: eq(manualPointsAdjustments.id, id),
            });
        }),
});

