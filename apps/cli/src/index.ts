import { program } from "commander";
import { version } from "../package.json";
import { initCommand } from "./command/init";
import { authCommand } from "./command/auth/auth";
import { competitionCommand } from "./command/competition/competition";
import { userConfig } from "./module/user-config/user-config";
import { getCommand } from "./command/get/get";

userConfig.ensureConfigDirectoryExists();

program
    .name("livecomp")
    .description("CLI tool for interacting with a Livecomp server")
    .version(version)
    .addCommand(initCommand)
    .addCommand(authCommand)
    .addCommand(competitionCommand)
    .addCommand(getCommand);

program.parse();

