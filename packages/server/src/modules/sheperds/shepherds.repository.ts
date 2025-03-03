import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { shepherds, type Shepherd } from "../../db/schema/venues";
import { stream } from "../../trpc/stream";

class ShepherdsRepository extends Repository<AppSchema, AppSchema["shepherds"], "shepherds"> {
    async afterCreate() {
        stream.broadcastInvalidateMessage("shepherds", "fetchAll");
    }

    async afterUpdate(row: Shepherd) {
        stream.broadcastInvalidateMessage("shepherds", "fetchAll");
        stream.broadcastInvalidateMessage("shepherds", "fetchById", { id: row.id });
    }

    async afterDelete() {
        stream.broadcastInvalidateMessage("shepherds", "fetchAll");
    }
}

export const shepherdsRepository = new ShepherdsRepository(appDb, shepherds);

