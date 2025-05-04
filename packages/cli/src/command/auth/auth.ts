import { Command } from "commander";
import { loginCommand } from "./login";
import { authStatusCommand } from "./status";
import { logoutCommand } from "./logout";

export const authCommand = new Command("auth")
    .addCommand(loginCommand)
    .addCommand(authStatusCommand)
    .addCommand(logoutCommand);

