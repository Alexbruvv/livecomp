import { log } from "./utils/log";
import { program } from "commander";
import { version } from "../package.json";
import { appRouter } from "./appRouter";
import { createTrpcContext } from "./trpc/trpc";
import { drizzleClient } from "./db/db";
import { userPasswords, users } from "./db/schema/auth";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { displaysRepository } from "./modules/displays/displays.repository";
import { displaysJob } from "./jobs/displays";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";
import fastify from "fastify";
import { fastifyTRPCPlugin, type FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify";
import ws from "@fastify/websocket";
import cors from "@fastify/cors";

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

        const server = fastify({
            maxParamLength: 5000,
        });

        server.register(cors);
        server.register(ws);
        server.register(fastifyTRPCPlugin, {
            prefix: "/trpc",
            useWSS: true,
            keepAlive: {
                enabled: true,
                pingMs: 30000,
                pongWaitMs: 5000,
            },
            trpcOptions: {
                router: appRouter,
                createContext: createTrpcContext,
                onError({ path, error }) {
                    // report to error monitoring
                    console.error(`Error in tRPC handler on path '${path}':`, error);
                },
            } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
        });

        await server.listen({ port });

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

