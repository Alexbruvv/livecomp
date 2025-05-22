import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { competitions, type Competition } from "../../db/schema/competitions";
import { stream } from "../../trpc/stream";

class CompetitionsRepository extends Repository<AppSchema, AppSchema["competitions"], "competitions"> {
    async afterCreate() {
        stream.broadcastInvalidateMessage("competitions", "fetchAll");
    }

    async afterUpdate(row: Competition) {
        stream.broadcastInvalidateMessage("competitions", "fetchAll");
        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: row.id });
    }

    async afterDelete(row: Competition) {
        stream.broadcastInvalidateMessage("competitions", "fetchAll");
        stream.broadcastInvalidateMessage("competitions", "fetchById", { id: row.id });
    }
}

export const competitionsRepository = new CompetitionsRepository(appDb, competitions);

