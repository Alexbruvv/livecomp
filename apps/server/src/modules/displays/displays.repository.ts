import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { displays, type Display } from "../../db/schema/displays";
import { stream } from "../../trpc/stream";

class DisplaysRepository extends Repository<AppSchema, AppSchema["displays"], "displays"> {
    async afterCreate() {
        stream.broadcastInvalidateMessage("displays", "fetchAll");
    }

    async afterUpdate(row: Display) {
        stream.broadcastInvalidateMessage("displays", "fetchAll");
        stream.broadcastInvalidateMessage("displays", "fetchById", { id: row.id });
        stream.broadcastInvalidateMessage("displays", "fetchByIdentifier", {
            competitionId: row.competitionId,
            identifier: row.identifier,
        });
    }

    async afterDelete(row: Display) {
        stream.broadcastInvalidateMessage("displays", "fetchAll");
        stream.broadcastInvalidateMessage("displays", "fetchById", { id: row.id });
        stream.broadcastInvalidateMessage("displays", "fetchByIdentifier", {
            competitionId: row.competitionId,
            identifier: row.identifier,
        });
    }
}

export const displaysRepository = new DisplaysRepository(appDb, displays);

