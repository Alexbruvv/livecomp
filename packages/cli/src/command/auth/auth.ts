import { Command } from "commander";
import { loginCommand } from "./login";
import { authStatusCommand } from "./status";

export const authCommand = new Command("auth").addCommand(loginCommand).addCommand(authStatusCommand);

