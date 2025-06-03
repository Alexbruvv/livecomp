import { CONFIG_FILE_PATH } from "../../constants";
import { stringify } from "yaml";
import { configSchema, defaultConfig, type Config } from "./schema";
import { loadConfig } from "zod-config";
import { yamlAdapter } from "zod-config/yaml-adapter";

async function saveDefaultConfig({ serverUrl, competitionId }: { serverUrl?: string; competitionId?: string } = {}) {
    const file = Bun.file(CONFIG_FILE_PATH);

    if (await file.exists()) {
        throw new Error(`Configuration file already exists at ${CONFIG_FILE_PATH}`);
    }

    await file.write(
        stringify({
            ...defaultConfig,

            instance: {
                server_url: serverUrl ?? defaultConfig.instance.server_url,
            },

            config: {
                competition_id: competitionId,
            },
        } satisfies Config)
    );
}

export async function loadCliConfig(path: string = CONFIG_FILE_PATH) {
    const file = Bun.file(path);

    if (!(await file.exists())) {
        throw new Error(`Configuration file not found at ${path}`);
    }

    return await loadConfig({
        schema: configSchema,
        adapters: yamlAdapter({
            path,
        }),
    });
}

export const config = {
    saveDefaultConfig,
};

