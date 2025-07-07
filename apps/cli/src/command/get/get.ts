import { Command } from "commander";
import { getTeamsCommand } from "./teams";

export const getCommand = new Command("get").alias("g").addCommand(getTeamsCommand);

