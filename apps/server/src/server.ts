import { log } from "./utils/log";
import { program } from "commander";
import { version } from "../package.json";
import { appRouter } from "./appRouter";
import { createBunServeHandler } from "trpc-bun-adapter";
import { createTrpcContext } from "./trpc/trpc";
import { drizzleClient } from "./db/db";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { displaysRepository } from "./modules/displays/displays.repository";
import { displaysJob } from "./jobs/displays";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";
import { api } from "./api/api";
import { matchHoldsJob } from "./jobs/matchHolds";
import { auth } from "./auth";
import { users } from "../auth-schema";
import { eq } from "drizzle-orm";
import { MatchHooksJob } from "./jobs/hooks";
import setupMatchEndedListener from "./listeners/match-ended";

program
    .name("livecomp-server")
    .version(version)
    .description("Livecomp server that provides a tRPC API with subscriptions");

program
    .command("start")
    .option("--migrate")
    .option("-p, --port <port>", "Port to listen on", "3000")
    .description("Start the server")
    .action(async (options) => {
        if (options.migrate) {
            log.info("Running migrations");
            await migrate(drizzleClient, {
                migrationsFolder: path.join(__dirname, "..", "drizzle"),
            });
            log.info("Migrations complete");
        }

        // Set all displays to offline
        await displaysRepository.update({
            online: false,
        });

        const port = parseInt(options.port);

        Bun.serve(
            createBunServeHandler(
                {
                    router: appRouter,
                    createContext: createTrpcContext,
                    endpoint: "/trpc",
                    responseMeta() {
                        return {
                            status: 200,
                            headers: {
                                "Access-Control-Allow-Origin": "*",
                                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                            },
                        };
                    },
                },
                {
                    port,
                    fetch: api.fetch,
                }
            )
        );

        log.info(`Server listening on port ${port}`);

        displaysJob.start();
        matchHoldsJob.start();
        new MatchHooksJob();
        log.info("Cron jobs started");

        setupMatchEndedListener();
        log.info("Listeners set up");
    });

program.command("add-superadmin-user <email> <password>").action(async (email: string, password: string) => {
    const { user } = await auth.api.createUser({
        body: {
            email,
            password,
            name: email.split("@")[0],
        },
    });

    auth.api.setUserPassword({
        body: {
            userId: user.id,
            newPassword: password,
        },
    });

    await drizzleClient
        .update(users)
        .set({
            role: "superAdmin",
        })
        .where(eq(users.id, user.id));

    log.info(`User ${email} added`);
    process.exit(0);
});

program.parse(process.argv);

export type AppRouter = typeof appRouter;
export type AppRouterInput = inferRouterInputs<AppRouter>;
export type AppRouterOutput = inferRouterOutputs<AppRouter>;

export type { Competition, Pause } from "./db/schema/competitions";
export type { Display } from "./db/schema/displays";
export type { Game, Scorer, StartingZone } from "./db/schema/games";
export type { Match, MatchPeriod, MatchAssignment, AutoMatchAssignmentConfig } from "./db/schema/matches";
export type { MatchScoreEntry, ManualPointsAdjustment } from "./db/schema/scores";
export type { Team } from "./db/schema/teams";
export type { Venue, Region, Shepherd } from "./db/schema/venues";

