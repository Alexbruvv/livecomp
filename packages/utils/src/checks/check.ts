import type { FullCompetition } from "../types";

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
    check: (competition: FullCompetition) => CheckResult;
}

export const check = (check: Check) => check;

