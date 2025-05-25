import { Command } from "commander";
import inquirer from "inquirer";
import { loadCliConfig } from "../../module/config";
import createCustomAuthClient from "../../module/auth";
import { userConfig } from "../../module/user-config/user-config";

export const loginCommand = new Command("login")
    .description("Authenticate with the Livecomp server")
    .argument("<username>", "The username to authenticate with")
    .action(async (username: string) => {
        const config = await loadCliConfig();
        const authClient = createCustomAuthClient({ baseUrl: config.instance.server_url });

        const { password } = await inquirer.prompt([
            {
                type: "password",
                name: "password",
                message: "Password:",
            },
        ]);

        try {
            const { data, error } = await authClient.signIn.username({
                username,
                password,
            });

            if (error) {
                console.error(`Failed to authenticate: ${error.statusText}`);
                return;
            }

            const authToken = data.token;

            if (authToken) {
                userConfig.update((cfg) => ({
                    ...cfg,
                    tokens: {
                        ...cfg.tokens,
                        [config.instance.server_url]: authToken,
                    },
                }));
            }

            console.log("Authentication successful!");
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
            console.error(`Failed to authenticate: ${errorMessage}`);
            return;
        }
    });

