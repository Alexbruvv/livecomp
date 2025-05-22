import { appDb } from "../../db/db";
import { Repository } from "../../db/repository";
import type { AppSchema } from "../../db/schema";
import { users, type User } from "../../db/schema/auth";
import { stream } from "../../trpc/stream";

class UsersRepository extends Repository<AppSchema, AppSchema["users"], "users"> {
    async afterCreate() {
        stream.broadcastInvalidateMessage("users", "fetchAll");
    }

    async afterUpdate(row: User) {
        stream.broadcastInvalidateMessage("users", "fetchAll");
        stream.broadcastInvalidateMessage("users", "fetchById", { id: row.id });
    }

    async afterDelete(row: User) {
        stream.broadcastInvalidateMessage("users", "fetchAll");
        stream.broadcastInvalidateMessage("users", "fetchById", { id: row.id });
    }
}

export const usersRepository = new UsersRepository(appDb, users);

