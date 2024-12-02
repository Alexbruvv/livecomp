import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { matches, type Match } from "../../db/schema/matches";
import { stream } from "../../trpc/stream";

class MatchesRepository extends Repository<AppSchema, AppSchema["matches"], "matches"> {
    async afterCreate() {
        stream.broadcastInvalidateMessage("matches", "fetchAll");
    }

    async afterUpdate(row: Match) {
        stream.broadcastInvalidateMessage("matches", "fetchAll");
        stream.broadcastInvalidateMessage("matches", "fetchById", { id: row.id });
    }

    async afterDelete(row: Match) {
        stream.broadcastInvalidateMessage("matches", "fetchAll");
        stream.broadcastInvalidateMessage("matches", "fetchById", { id: row.id });
    }
}

export const matchesRepository = new MatchesRepository(appDb, matches);

