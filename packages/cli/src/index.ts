import { program } from "commander";
import { version } from "../package.json";
import { initCommand } from "./command/init";
import { authCommand } from "./command/auth/auth";

program
    .name("livecomp")
    .description("CLI tool for interacting with a Livecomp server")
    .version(version)
    .addCommand(initCommand)
    .addCommand(authCommand);

program.parse();

