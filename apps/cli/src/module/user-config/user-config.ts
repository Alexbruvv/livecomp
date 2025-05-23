import path from "path";
import fs from "fs";
import os from "os";
import { defaultUserConfig, type UserConfig } from "./schema";

function getConfigDirectoryPath() {
    return path.join(os.homedir(), ".config", "livecomp");
}

function ensureConfigDirectoryExists() {
    const configDir = getConfigDirectoryPath();
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
}

function read() {
    const configDir = getConfigDirectoryPath();
    const configFilePath = path.join(configDir, "config.json");

    if (!fs.existsSync(configFilePath)) {
        fs.writeFileSync(configFilePath, JSON.stringify(defaultUserConfig, null, 2));
    }

    const configContent = fs.readFileSync(configFilePath, "utf-8");
    return JSON.parse(configContent) as UserConfig;
}

function update(updater: (config: UserConfig) => UserConfig) {
    const configDir = getConfigDirectoryPath();
    const configFilePath = path.join(configDir, "config.json");

    if (!fs.existsSync(configFilePath)) {
        fs.writeFileSync(configFilePath, JSON.stringify(defaultUserConfig, null, 2));
    }

    const configContent = fs.readFileSync(configFilePath, "utf-8");
    const config = JSON.parse(configContent) as UserConfig;

    const updatedConfig = updater(config);

    fs.writeFileSync(configFilePath, JSON.stringify(updatedConfig, null, 2));
}

export const userConfig = {
    getConfigDirectoryPath,
    ensureConfigDirectoryExists,
    read,
    update,
};

