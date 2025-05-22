import type { AppRouterOutput } from "../../../../apps/server/src/server";
import type { ExcludeNull } from "../types";

interface SuccessfulCheckResult {
    success: true;
}

interface FailedCheckResult {
    success: false;
    message: string;
}

export const CheckResult = {
    success: () => ({ success: true }) as SuccessfulCheckResult,
    failure: (message: string) => ({ success: false, message }) as FailedCheckResult,
};

type CheckResult = SuccessfulCheckResult | FailedCheckResult;

interface Check {
    identifier: string;
    description: string;
    check: (competition: ExcludeNull<AppRouterOutput["competitions"]["fetchById"]>) => CheckResult;
}

export const check = (check: Check) => check;

