import { z } from "zod";
import { CONFIG_FILE_PATH } from "../../constants";
import { stringify } from "smol-toml";
import { defaultConfig } from "./schema";

async function saveDefaultConfig() {
    const file = Bun.file(CONFIG_FILE_PATH);

    if (await file.exists()) {
        throw new Error(`Configuration file already exists at ${CONFIG_FILE_PATH}`);
    }

    await file.write(stringify(defaultConfig));
}

export const config = {
    saveDefaultConfig,
};

