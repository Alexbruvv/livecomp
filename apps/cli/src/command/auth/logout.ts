import { Command } from "commander";
import { loadCliConfig } from "../../module/config";
import { userConfig } from "../../module/user-config/user-config";

export const logoutCommand = new Command("logout").action(async () => {
    const config = await loadCliConfig();

    userConfig.update((userCfg) => ({
        ...userCfg,
        tokens: {
            ...userCfg.tokens,
            [config.instance.server_url]: undefined,
        },
    }));

    console.log("Logged out successfully.");
});

