import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { venues, type Venue } from "../../db/schema/venues";
import { stream } from "../../trpc/stream";

class VenuesRepository extends Repository<AppSchema, AppSchema["venues"], "venues"> {
    async afterCreate() {
        stream.broadcastInvalidateMessage("venues", "fetchAll");
    }

    async afterUpdate(row: Venue) {
        stream.broadcastInvalidateMessage("venues", "fetchAll");
        stream.broadcastInvalidateMessage("venues", "fetchById", { id: row.id });
    }

    async afterDelete() {
        stream.broadcastInvalidateMessage("venues", "fetchAll");
    }
}

export const venuesRepository = new VenuesRepository(appDb, venues);

