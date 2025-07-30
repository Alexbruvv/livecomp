import { FullCompetition } from "@livecomp/utils";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { api } from "../utils/trpc";
import { CompetitionDiffEvent } from "@livecomp/server";
import { hash } from "fast-json-stable-hash";
import useTaskQueue from "../hooks/use-task-queue";
import { merge } from "ts-deepmerge";

const context = createContext<{
    competition: FullCompetition | null;
    status: "error" | "idle" | "connecting" | "pending";
}>({
    competition: null,
    status: "error",
});

export function CompetitionProvider({ competitionId, children }: { competitionId: string } & PropsWithChildren) {
    const utils = api.useUtils();
    const [competition, setCompetition] = useState<FullCompetition | null>(null);
    const taskQueue = useTaskQueue({ shouldProcess: true });

    const synchroniseState = async () => {
        const competitionData = await utils.client.competitions.fetchById.query({ id: competitionId });

        if (competitionData) {
            setCompetition(competitionData);
        } else {
            setCompetition(null);
        }
    };

    const handleDiffEvent = async (event: CompetitionDiffEvent) => {
        const nextState = merge(competition as FullCompetition, event.diff as FullCompetition);
        const compHash = hash(nextState, "sha256");

        if (compHash !== event.hash) {
            console.warn(
                `Received competition diff with hash ${event.hash} but computed hash is ${compHash}. Re-fetching competition state.`
            );
            await synchroniseState();
            return;
        }

        setCompetition(nextState);
    };

    const { status } = api.stream.competitionDiffs.useSubscription(
        { competitionId },
        {
            onData: (event) => taskQueue.addTask(() => handleDiffEvent(event)),
            onStarted: synchroniseState,
        }
    );

    return (
        <context.Provider value={{ competition, status }}>
            {competition ? children : <div>Loading competition...</div>}
        </context.Provider>
    );
}

export function useCompetition() {
    const { competition } = useContext(context);

    if (!competition) {
        throw new Error("useCompetition must be used within a CompetitionProvider");
    }

    return competition;
}

export function useCompetitionSyncStatus() {
    const { status } = useContext(context);

    if (!status) {
        throw new Error("useCompetitionSyncStatus must be used within a CompetitionProvider");
    }

    return status;
}
