import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { manualPointsAdjustments } from "../../db/schema/scores";
import { stream } from "../../trpc/stream";

class ManualPointsAdjustmentsRepository extends Repository<
    AppSchema,
    AppSchema["manualPointsAdjustments"],
    "manualPointsAdjustments"
> {
    async afterCreate() {
        stream.broadcastInvalidateMessage("teams", "fetchAllScores");
    }

    async afterUpdate() {
        stream.broadcastInvalidateMessage("teams", "fetchAllScores");
    }

    async afterDelete() {
        stream.broadcastInvalidateMessage("teams", "fetchAllScores");
    }
}

export const manualPointsAdjustmentsRepository = new ManualPointsAdjustmentsRepository(appDb, manualPointsAdjustments);

