import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { matchScoreEntries, type MatchScoreEntry } from "../../db/schema/scores";
import { stream } from "../../trpc/stream";

class MatchScoreEntriesRepository extends Repository<AppSchema, AppSchema["matchScoreEntries"], "matchScoreEntries"> {
    async afterCreate(row: MatchScoreEntry) {
        stream.broadcastInvalidateMessage("teams", "fetchAllScores");
        stream.broadcastInvalidateMessage("matches", "fetchById", { id: row.matchId });
        stream.broadcastInvalidateMessage("competitions", "fetchById");
    }

    async afterUpdate(row: MatchScoreEntry) {
        stream.broadcastInvalidateMessage("teams", "fetchAllScores");
        stream.broadcastInvalidateMessage("matches", "fetchById", { id: row.matchId });
        stream.broadcastInvalidateMessage("competitions", "fetchById");
    }

    async afterDelete(row: MatchScoreEntry) {
        stream.broadcastInvalidateMessage("teams", "fetchAllScores");
        stream.broadcastInvalidateMessage("matches", "fetchById", { id: row.matchId });
        stream.broadcastInvalidateMessage("competitions", "fetchById");
    }
}

export const matchScoreEntriesRepository = new MatchScoreEntriesRepository(appDb, matchScoreEntries);

