import { competitionsRouter } from "./modules/competitions/competitions.router";
import { devToolsRouter } from "./modules/dev-tools/dev-tools.router";
import { displaysRouter } from "./modules/displays/displays.router";
import { gamesRouter } from "./modules/games/games.router";
import { matchesRouter } from "./modules/matches/matches.router";
import { matchPeriodsRouter } from "./modules/match-periods/match-periods.router";
import { regionsRouter } from "./modules/regions/regions.router";
import { scoresRouter } from "./modules/scores/scores.router";
import { shepherdsRouter } from "./modules/sheperds/shepherds.router";
import { startingZonesRouter } from "./modules/starting-zones/starting-zones.router";
import { teamsRouter } from "./modules/teams/teams.router";
import { venuesRouter } from "./modules/venues/venues.router";
import { streamRouter } from "./trpc/stream";
import { router } from "./trpc/trpc";

export const appRouter = router({
    stream: streamRouter,
    games: gamesRouter,
    startingZones: startingZonesRouter,
    venues: venuesRouter,
    regions: regionsRouter,
    shepherds: shepherdsRouter,
    competitions: competitionsRouter,
    teams: teamsRouter,
    matchPeriods: matchPeriodsRouter,
    matches: matchesRouter,
    scores: scoresRouter,
    displays: displaysRouter,
    devTools: devToolsRouter,
});

