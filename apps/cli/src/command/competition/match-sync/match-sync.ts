import { Command } from "commander";
import { matchSyncPushCommand } from "./push";
import { matchSyncPullCommnad } from "./pull";

export const matchSyncCommand = new Command("match-sync")
    .alias("msync")
    .addCommand(matchSyncPullCommnad)
    .addCommand(matchSyncPushCommand);

