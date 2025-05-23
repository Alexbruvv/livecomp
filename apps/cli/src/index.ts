import { program } from "commander";
import { version } from "../package.json";
import { initCommand } from "./command/init";
import { authCommand } from "./command/auth/auth";
import { competitionCommand } from "./command/competition/competition";
import path from "path";
import fs from "fs";

// Require keyring addon to ensure it is bundled
const fileName = require.resolve("@napi-rs/keyring/package.json");
const dirName = path.dirname(fileName);
const files = fs.readdirSync(dirName);

files.forEach((file) => {
    if (file.endsWith(".node")) {
        import(path.join(dirName, file));
    }
});

program
    .name("livecomp")
    .description("CLI tool for interacting with a Livecomp server")
    .version(version)
    .addCommand(initCommand)
    .addCommand(authCommand)
    .addCommand(competitionCommand);

program.parse();

