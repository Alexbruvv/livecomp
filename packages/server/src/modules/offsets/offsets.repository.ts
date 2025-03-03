import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { offsets, type Offset } from "../../db/schema/competitions";
import { stream } from "../../trpc/stream";

export class OffsetsRepository extends Repository<AppSchema, AppSchema["offsets"], "offsets"> {
    async afterCreate(row: Offset) {
        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: row.competitionId });
    }

    async afterUpdate(row: Offset) {
        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: row.competitionId });
    }

    async afterDelete(row: Offset) {
        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: row.competitionId });
    }
}

export const offsetsRepository = new OffsetsRepository(appDb, offsets);

