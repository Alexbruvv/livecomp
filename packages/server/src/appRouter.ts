import { authRouter } from "./modules/auth/auth.router";
import { usersRouter } from "./modules/auth/users.router";
import { gamesRouter } from "./modules/games/games.router";
import { router } from "./trpc/trpc";

export const appRouter = router({
    auth: authRouter,
    users: usersRouter,
    games: gamesRouter,
});

