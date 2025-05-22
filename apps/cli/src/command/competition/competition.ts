import { Command } from "commander";
import { pauseCommand } from "./pause";
import { competitionStatusCommand } from "./status";
import { resumeCommand } from "./resume";
import { checkCommand } from "./check";

export const competitionCommand = new Command("competition")
    .alias("comp")
    .addCommand(competitionStatusCommand)
    .addCommand(checkCommand)
    .addCommand(pauseCommand)
    .addCommand(resumeCommand);

