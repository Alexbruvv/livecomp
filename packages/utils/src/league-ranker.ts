import type { Team } from "@livecomp/server";
import type { FullCompetition } from ".";

interface TeamRankingData {
    team: Team;
    leaguePoints: number;
    gamePoints: number;
    gamePointsStdDev: number;
}

export enum RankingCheckType {
    LeaguePoints = "LeaguePoints",
    GamePoints = "GamePoints",
    GamePointsStdDev = "GamePointsStdDev",
}

const checks: Array<{
    type: RankingCheckType;
    beats(teamData: TeamRankingData, otherTeamData: TeamRankingData): boolean;
}> = [
    {
        type: RankingCheckType.LeaguePoints,
        beats: (teamData, otherTeamData) => teamData.leaguePoints > otherTeamData.leaguePoints,
    },
    {
        type: RankingCheckType.GamePoints,
        beats: (teamData, otherTeamData) => teamData.gamePoints > otherTeamData.gamePoints,
    },
    {
        type: RankingCheckType.GamePointsStdDev,
        beats: (teamData, otherTeamData) => teamData.gamePointsStdDev < otherTeamData.gamePointsStdDev,
    },
];

export class LeagueRanker {
    constructor(public readonly competition: FullCompetition) {}

    private getTeamRankingData(team: FullCompetition["teams"][number]): TeamRankingData {
        const matches = this.competition.matches.filter(
            (match) => match.type === "league" && match.assignments.some((assignment) => assignment.teamId === team.id)
        );
        const gamePointValues = matches.map((match) => match.scoreEntry?.gamePoints[team.id] ?? 0);
        const gamePointsMean = gamePointValues.reduce((sum, value) => sum + value, 0) / matches.length;
        const gamePointsStdDev = Math.sqrt(
            gamePointValues.map((x) => Math.pow(x - gamePointsMean, 2)).reduce((sum, value) => sum + value, 0) /
                gamePointValues.length -
                1
        );

        return {
            team,
            leaguePoints:
                matches.reduce((total, match) => total + (match.scoreEntry?.leaguePoints[team.id] ?? 0), 0) +
                team.pointsAdjustments.reduce((total, adjustment) => total + adjustment.leaguePoints, 0),
            gamePoints: matches.reduce((total, match) => total + (match.scoreEntry?.gamePoints[team.id] ?? 0), 0),
            gamePointsStdDev,
        };
    }

    /**
     * Get the rankings of teams in the competition.
     *
     * Teams are ranked by:
     * 1. League points (descending)
     * 2. Game points (descending)
     * 3. Game points standard deviation (ascending)
     *
     * Teams have the same rank if they are equal in all three criteria.
     * Rankings start at 1, with the best team being ranked 1.
     *
     * @returns An object mapping team IDs to their rank.
     */
    public getRankings(): Record<string, number> {
        const teamValues = this.competition.teams.map((team) => this.getTeamRankingData(team));

        // The best team is at the start of the array
        const sortedTeams = teamValues.sort((a, b) => {
            for (const check of checks) {
                if (check.beats(a, b)) return -1;
                if (check.beats(b, a)) return 1;
            }
            return 0; // Teams are equal in all criteria
        });

        const rankings: Array<[string, number]> = [];
        let currentRank = 1;
        let lastTeamData: TeamRankingData | null = null;
        for (const teamData of sortedTeams) {
            if (lastTeamData === null) {
                lastTeamData = teamData;
                rankings.push([teamData.team.id, currentRank]);
                continue;
            }

            if (checks.some((check) => check.beats(lastTeamData!, teamData))) {
                currentRank++;
                lastTeamData = teamData;
                rankings.push([teamData.team.id, currentRank]);
            } else {
                lastTeamData = teamData;
                rankings.push([teamData.team.id, currentRank]); // Same rank as last team
            }
        }

        return Object.fromEntries(rankings);
    }
}

