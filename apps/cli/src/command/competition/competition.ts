import { Command } from "commander";
import { pauseCommand } from "./pause";
import { competitionStatusCommand } from "./status";
import { resumeCommand } from "./resume";
import { checkCommand } from "./check";
import { matchSyncCommand } from "./match-sync/match-sync";

export const competitionCommand = new Command("competition")
    .alias("comp")
    .addCommand(competitionStatusCommand)
    .addCommand(checkCommand)
    .addCommand(matchSyncCommand)
    .addCommand(pauseCommand)
    .addCommand(resumeCommand);

