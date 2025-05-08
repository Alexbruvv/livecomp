import { Command } from "commander";
import { pauseCommand } from "./pause";
import { competitionStatusCommand } from "./status";
import { resumeCommand } from "./resume";

export const competitionCommand = new Command("competition")
    .alias("comp")
    .addCommand(competitionStatusCommand)
    .addCommand(pauseCommand)
    .addCommand(resumeCommand);

