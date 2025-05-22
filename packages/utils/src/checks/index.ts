import { allTeamsHaveLeagueMatchCheck } from "./all-teams-have-league-match-check";
import { allocatedTimeCheck } from "./allocated-time-check";
import { matchAllocationsCheck } from "./match-allocations-check";
import { matchPeriodOverlapsCheck } from "./match-period-overlaps-check";
import { missingScoresCheck } from "./missing-scores-check";
import { withinCompetitionBoundsCheck } from "./within-competition-bounds-check";

export const competitionChecks = [
    allocatedTimeCheck,
    matchAllocationsCheck,
    withinCompetitionBoundsCheck,
    allTeamsHaveLeagueMatchCheck,
    matchPeriodOverlapsCheck,
    missingScoresCheck,
];

