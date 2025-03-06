import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { games, type Game } from "../../db/schema/games";
import { stream } from "../../trpc/stream";

class GamesRepository extends Repository<AppSchema, AppSchema["games"], "games"> {
    async afterCreate() {
        stream.broadcastInvalidateMessage("games", "fetchAll");
    }

    async afterUpdate(row: Game) {
        stream.broadcastInvalidateMessage("games", "fetchAll");
        stream.broadcastInvalidateMessage("games", "fetchById", { id: row.id });
        stream.broadcastInvalidateMessage("competitions", "fetchById");
    }

    async afterDelete() {
        stream.broadcastInvalidateMessage("games", "fetchAll");
    }
}

export const gamesRepository = new GamesRepository(appDb, games);

