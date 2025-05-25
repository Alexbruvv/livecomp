import { PropsWithChildren } from "react";
import areDevToolsEnabled from "../../../utils/devTools";

export default function DevToolsOnly({ children }: PropsWithChildren) {
    return areDevToolsEnabled() ? children : null;
}

