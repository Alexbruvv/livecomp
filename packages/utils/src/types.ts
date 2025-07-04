import type { AppRouterOutput } from "@livecomp/server";

export type MatchStatus = "notStarted" | "staging" | "inProgress" | "finished";

export type ExcludeNull<T> = T extends null ? never : T;

export type FullCompetition = ExcludeNull<AppRouterOutput["competitions"]["fetchById"]>;

