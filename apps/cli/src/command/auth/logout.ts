import { Command } from "commander";
import { loadCliConfig } from "../../module/config";
import { getKeychainEntry } from "../../module/keychain";

export const logoutCommand = new Command("logout").action(async () => {
    const config = await loadCliConfig();
    getKeychainEntry(config.instance.server_url).deleteCredential();

    console.log("Logged out successfully.");
});

