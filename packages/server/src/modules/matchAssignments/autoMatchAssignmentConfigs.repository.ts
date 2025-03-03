import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { autoMatchAssignmentConfigs } from "../../db/schema/matches";
import { stream } from "../../trpc/stream";

class AutoMatchAssignmentConfigsRepository extends Repository<
    AppSchema,
    AppSchema["autoMatchAssignmentConfigs"],
    "autoMatchAssignmentConfigs"
> {
    async afterCreate() {
        stream.broadcastInvalidateMessage("matches", "fetchAll");
        stream.broadcastInvalidateMessage("matches", "fetchById");
    }

    async afterUpdate() {
        stream.broadcastInvalidateMessage("matches", "fetchAll");
        stream.broadcastInvalidateMessage("matches", "fetchById");
    }

    async afterDelete() {
        stream.broadcastInvalidateMessage("matches", "fetchAll");
        stream.broadcastInvalidateMessage("matches", "fetchById");
    }
}

export const autoMatchAssignmentConfigsRepository = new AutoMatchAssignmentConfigsRepository(
    appDb,
    autoMatchAssignmentConfigs
);

