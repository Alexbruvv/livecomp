import chalk from "chalk";

const PREFIX = chalk.greenBright("[livecomp-server]");

function createLogger(levelPrefix: string) {
    return (...args: unknown[]) => {
        console.log(PREFIX, levelPrefix, ...args);
    };
}

export const log = {
    info: createLogger(chalk.blueBright("[info]")),
    warn: createLogger(chalk.yellowBright("[warn]")),
    error: createLogger(chalk.redBright("[error]")),
};

