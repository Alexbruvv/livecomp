import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { type StartingZone, startingZones } from "../../db/schema/games";
import { stream } from "../../trpc/stream";

class StartingZonesRepository extends Repository<AppSchema, AppSchema["startingZones"], "startingZones"> {
    async afterCreate() {
        stream.broadcastInvalidateMessage("startingZones", "fetchAll");
    }

    async afterUpdate(row: StartingZone) {
        stream.broadcastInvalidateMessage("startingZones", "fetchAll");
        stream.broadcastInvalidateMessage("startingZones", "fetchById", { id: row.id });
        stream.broadcastInvalidateMessage("competitions", "fetchById");
    }

    async afterDelete() {
        stream.broadcastInvalidateMessage("startingZones", "fetchAll");
    }
}

export const startingZonesRepository = new StartingZonesRepository(appDb, startingZones);

