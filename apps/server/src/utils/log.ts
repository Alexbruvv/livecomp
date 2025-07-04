import chalk from "chalk";

const PREFIX = chalk.greenBright("[livecomp-server]");

function createLogger(levelPrefix: string, onlyInDev = false) {
    return (...args: unknown[]) => {
        if (onlyInDev && process.env.NODE_ENV !== "development") return;
        console.log(PREFIX, levelPrefix, ...args);
    };
}

export const log = {
    debug: createLogger(chalk.cyanBright("[debug]"), true),
    info: createLogger(chalk.blueBright("[info]")),
    warn: createLogger(chalk.yellowBright("[warn]")),
    error: createLogger(chalk.redBright("[error]")),
};

