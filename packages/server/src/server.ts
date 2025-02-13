import { log } from "./utils/log";
import { program } from "commander";
import { version } from "../package.json";
import { appRouter } from "./appRouter";
import { createBunServeHandler } from "trpc-bun-adapter";
import { createTrpcContext } from "./trpc/trpc";
import { drizzleClient } from "./db/db";
import { userPasswords, users } from "./db/schema/auth";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { displaysRepository } from "./modules/displays/displays.repository";
import { displaysJob } from "./jobs/displays";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";

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
                }
            )
        );

        log.info(`Server listening on port ${port}`);

        displaysJob.start();
        log.info("Cron jobs started");
    });

program.command("add-sysadmin-user <username> <password>").action(async (username: string, password: string) => {
    const user = (
        await drizzleClient
            .insert(users)
            .values({
                name: username,
                username,
                role: "sysadmin",
            })
            .returning()
    )[0];

    await drizzleClient.insert(userPasswords).values({
        userId: user.id,
        passwordHash: await Bun.password.hash(password),
    });

    log.info(`Sysadmin user ${username} added`);
    process.exit(0);
});

program.parse(process.argv);

export type AppRouter = typeof appRouter;
export type AppRouterInput = inferRouterInputs<AppRouter>;
export type AppRouterOutput = inferRouterOutputs<AppRouter>;

