import { allocatedTimeCheck } from "./allocated-time-check";
import { matchAllocationsCheck } from "./match-allocations-check";
import { withinCompetitionBoundsCheck } from "./within-competition-bounds-check";

export const competitionChecks = [allocatedTimeCheck, matchAllocationsCheck, withinCompetitionBoundsCheck];

