import { Command } from "commander";
import yoctoSpinner from "yocto-spinner";
import { config } from "../module/config";
import { createApiClient } from "../module/api";

export const initCommand = new Command("init")
    .description("Initialises a new Livecomp configuration in the current directory")
    .argument("<server-url>", "The URL of the Livecomp server")
    .action(async (serverUrl: string) => {
        const client = createApiClient(serverUrl);

        const spinner = yoctoSpinner({ text: "Saving default configuration..." }).start();
        try {
            await config.saveDefaultConfig();
            spinner.success("Default configuration saved");
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            spinner.error(`Failed to save default configuration: ${errorMessage}`);
        }
    });

