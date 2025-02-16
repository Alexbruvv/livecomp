import { z } from "zod";
import { restrictedProcedure, router } from "../../trpc/trpc";
import { matchPeriodsRepository } from "../matchPeriods/matchPeriods.repository";
import { DateTime } from "luxon";
import { eq } from "drizzle-orm";
import { matchPeriods } from "../../db/schema/matches";
import { pausesRepository } from "../pauses/pauses.repository";
import { offsets, pauses } from "../../db/schema/competitions";
import { offsetsRepository } from "../offsets/offsets.repository";

export const devToolsRouter = router({
    resetMatchPeriod: restrictedProcedure("admin")
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input: { id } }) => {
            const now = DateTime.now();

            const matchPeriod = await matchPeriodsRepository.findFirst({
                where: eq(matchPeriods.id, id),
            });

            if (matchPeriod) {
                await pausesRepository.delete({
                    where: eq(pauses.competitionId, matchPeriod.competitionId),
                });
                await offsetsRepository.delete({
                    where: eq(offsets.competitionId, matchPeriod.competitionId),
                });
            }

            await matchPeriodsRepository.update(
                {
                    startsAt: now.plus({ seconds: 60 - now.second }).toJSDate(),
                },
                { where: eq(matchPeriods.id, id) }
            );
        }),
});

