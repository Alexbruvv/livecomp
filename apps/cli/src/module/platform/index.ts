import os from "os";

const VALID_PLATFORM_IDENTIFIERS = new Set(["linux-x64", "linux-arm64", "darwin-x64", "darwin-arm64", "win32-x64"]);

function getIdentifier() {
    const platform = os.platform();
    const arch = os.arch();

    const identifier = `${platform}-${arch}`;

    if (!VALID_PLATFORM_IDENTIFIERS.has(identifier)) {
        throw new Error(`Unsupported platform: ${identifier}`);
    }

    return identifier;
}

function isLinux() {
    return os.platform() === "linux";
}

function isMac() {
    return os.platform() === "darwin";
}

function isWindows() {
    return os.platform() === "win32";
}

export const platform = {
    getIdentifier,
    isLinux,
    isMac,
    isWindows,
};

