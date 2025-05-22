import { PropsWithChildren } from "react";
import areDevToolsEnabled from "../../../utils/devToos";

export default function DevToolsOnly({ children }: PropsWithChildren) {
    return areDevToolsEnabled() ? children : null;
}

