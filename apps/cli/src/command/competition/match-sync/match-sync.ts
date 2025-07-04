import { Command } from "commander";
import { matchSyncPushCommand } from "./push";
import { matchSyncPullCommnad } from "./pull";
import { matchSyncGenerateCommand } from "./generate";

export const matchSyncCommand = new Command("match-sync")
    .alias("msync")
    .addCommand(matchSyncGenerateCommand)
    .addCommand(matchSyncPullCommnad)
    .addCommand(matchSyncPushCommand);

