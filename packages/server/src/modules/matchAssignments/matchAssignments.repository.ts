import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { matchAssignments, type MatchAssignment } from "../../db/schema/matches";
import { stream } from "../../trpc/stream";

class MatchAssignmentsRepository extends Repository<AppSchema, AppSchema["matchAssignments"], "matchAssignments"> {
    async afterCreate(row: MatchAssignment) {
        stream.broadcastInvalidateMessage("matches", "fetchAll");
        stream.broadcastInvalidateMessage("matches", "fetchById", { id: row.matchId });
        stream.broadcastInvalidateMessage("competitions", "fetchById");
    }

    async afterUpdate(row: MatchAssignment) {
        stream.broadcastInvalidateMessage("matches", "fetchAll");
        stream.broadcastInvalidateMessage("matches", "fetchById", { id: row.matchId });
        stream.broadcastInvalidateMessage("competitions", "fetchById");
    }

    async afterDelete(row: MatchAssignment) {
        stream.broadcastInvalidateMessage("matches", "fetchAll");
        stream.broadcastInvalidateMessage("matches", "fetchById", { id: row.matchId });
        stream.broadcastInvalidateMessage("competitions", "fetchById");
    }
}

export const matchAssignmentsRepository = new MatchAssignmentsRepository(appDb, matchAssignments);

