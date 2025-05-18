import { CONFIG_FILE_PATH } from "../../constants";
import { stringify } from "smol-toml";
import { configSchema, defaultConfig, type Config } from "./schema";
import { loadConfig } from "zod-config";
import { tomlAdapter } from "zod-config/toml-adapter";

async function saveDefaultConfig({ competitionId }: { competitionId?: string } = {}) {
    const file = Bun.file(CONFIG_FILE_PATH);

    if (await file.exists()) {
        throw new Error(`Configuration file already exists at ${CONFIG_FILE_PATH}`);
    }

    await file.write(
        stringify({
            ...defaultConfig,

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
        adapters: tomlAdapter({
            path,
        }),
    });
}

export const config = {
    saveDefaultConfig,
};

