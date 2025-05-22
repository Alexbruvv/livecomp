import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { pauses, type Pause } from "../../db/schema/competitions";
import { stream } from "../../trpc/stream";

export class PausesRepository extends Repository<AppSchema, AppSchema["pauses"], "pauses"> {
    async afterCreate(row: Pause) {
        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: row.competitionId });
    }

    async afterUpdate(row: Pause) {
        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: row.competitionId });
    }

    async afterDelete(row: Pause) {
        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: row.competitionId });
    }
}

export const pausesRepository = new PausesRepository(appDb, pauses);
