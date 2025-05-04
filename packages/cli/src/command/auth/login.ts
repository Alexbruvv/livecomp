import { Command } from "commander";
import inquirer from "inquirer";
import { loadCliConfig } from "../../module/config";
import { createApiClient } from "../../module/api";
import { Entry } from "@napi-rs/keyring";
import { KEYCHAIN_SERVICE_NAME } from "../../constants";
import { getKeychainEntry } from "../../module/keychain";

export const loginCommand = new Command("login")
    .description("Authenticate with the Livecomp server")
    .argument("<username>", "The username to authenticate with")
    .action(async (username: string) => {
        const config = await loadCliConfig();
        const client = createApiClient(config.instance.server_url);

        const { password } = await inquirer.prompt([
            {
                type: "password",
                name: "password",
                message: "Password:",
            },
        ]);

        try {
            const { token } = await client.auth.login.mutate({
                username,
                password,
            });

            const tokenEntry = getKeychainEntry(config.instance.server_url);
            tokenEntry.setPassword(token);

            console.log("Authentication successful!");
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            console.error(`Failed to authenticate: ${errorMessage}`);
            return;
        }
    });

