import { eq } from "drizzle-orm";
import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { regions, shepherds, type Region } from "../../db/schema/venues";
import { stream } from "../../trpc/stream";
import { shepherdsRepository } from "../sheperds/shepherds.repository";

class RegionsRepository extends Repository<AppSchema, AppSchema["regions"], "regions"> {
    async afterCreate() {
        stream.broadcastInvalidateMessage("regions", "fetchAll");
    }

    async afterUpdate(row: Region) {
        stream.broadcastInvalidateMessage("regions", "fetchAll");
        stream.broadcastInvalidateMessage("regions", "fetchById", { id: row.id });
    }

    async afterDelete(row: Region) {
        stream.broadcastInvalidateMessage("regions", "fetchAll");

        // Remove the region from all shepherds that have it
        for (const shepherd of await shepherdsRepository.findMany()) {
            if (shepherd.regionIds.includes(row.id)) {
                await shepherdsRepository.update(
                    {
                        regionIds: shepherd.regionIds.filter((id) => id !== row.id),
                    },
                    { where: eq(shepherds.id, shepherd.id) }
                );
            }
        }
    }
}

export const regionsRepository = new RegionsRepository(appDb, regions);

