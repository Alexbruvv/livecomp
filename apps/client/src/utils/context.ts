import { User } from "@livecomp/server/src/db/schema/auth";
import { createContext } from "react";

export const AuthContext = createContext<{ hasLoaded: boolean; user: User | undefined }>({
    hasLoaded: false,
    user: undefined,
});

