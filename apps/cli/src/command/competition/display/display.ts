import { Command } from "commander";
import { displayMessageCommand } from "./message";

export const displayCommand = new Command("display").alias("d").addCommand(displayMessageCommand);

