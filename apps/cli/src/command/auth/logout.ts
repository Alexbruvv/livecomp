import { Command } from "commander";
import { loadCliConfig } from "../../module/config";
import { userConfig } from "../../module/user-config/user-config";
import createCustomAuthClient from "../../module/auth";

export const logoutCommand = new Command("logout").action(async () => {
    const config = await loadCliConfig();

    const authClient = createCustomAuthClient({ baseUrl: config.instance.server_url });
    const { data } = await authClient.getSession();

    await authClient.signOut();

    if (!data?.session) {
        console.log("Not authenticated. Please log in using 'livecomp auth login'");
        return;
    }

    userConfig.update((userCfg) => ({
        ...userCfg,
        tokens: {
            ...userCfg.tokens,
            [config.instance.server_url]: undefined,
        },
    }));

    console.log("Logged out successfully.");
});

