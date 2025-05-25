import { useCollection } from "@cloudscape-design/collection-hooks";
import { Table, Header, SpaceBetween, Pagination, Icon } from "@cloudscape-design/components";
import Restricted from "../util/Restricted";
import { AppRouterOutput } from "@livecomp/server";
import CreateMatchModalButton from "./CreateMatchModalButton";
import DeleteMatchButton from "./DeleteMatchButton";
import { RoutedLink } from "../util/RoutedLink";
import { api } from "../../../utils/trpc";
import MatchStatusIndicator from "./MatchStatusIndicator";
import useCompetitionClock from "../../../hooks/useCompetitionClock";

export default function MatchesTable({
    matches,
    matchesPending,
    competitionId,
}: {
    matches: AppRouterOutput["matches"]["fetchAll"] | undefined;
    matchesPending: boolean;
    competitionId: string;
}) {
    const { items, collectionProps, paginationProps } = useCollection(matches ?? [], {
        sorting: {
            defaultState: {
                sortingColumn: {
                    sortingField: "sequenceNumber",
                },
            },
        },
        pagination: {
            pageSize: 5,
        },
    });

    const { data: competition } = api.competitions.fetchById.useQuery({ id: competitionId });
    const competitionClock = useCompetitionClock(competition);

    return (
        <Table
            header={
                <Header
                    actions={
                        <Restricted permissions={{ competition: ["configure"] }}>
                            <SpaceBetween size="s">
                                <CreateMatchModalButton competitionId={competitionId} />
                            </SpaceBetween>
                        </Restricted>
                    }
                    counter={`(${matches?.length ?? "..."})`}
                >
                    Matches
                </Header>
            }
            loading={matchesPending}
            loadingText={"Loading matches"}
            items={items}
            columnDefinitions={[
                {
                    id: "name",
                    header: "Name",
                    cell: (match) => (
                        <>
                            <RoutedLink
                                to="/console/competitions/$competitionId/matches/$matchId"
                                params={{ competitionId, matchId: match.id }}
                            >
                                {match.name}
                            </RoutedLink>
                            <span style={{ marginLeft: "10px" }} />
                            {match.released && <Icon name="check" />}
                        </>
                    ),
                    width: "15%",
                },
                {
                    id: "type",
                    header: "Type",
                    cell: (match) => (match.type === "league" ? "League" : "Knockout"),
                    width: "15%",
                },
                {
                    id: "status",
                    header: "Status",
                    cell: (match) => <MatchStatusIndicator status={competitionClock?.getMatchStatus(match.id)} />,
                    width: "15%",
                },
                {
                    id: "sequenceNumber",
                    header: "Sequence number",
                    cell: (match) => match.sequenceNumber,
                    width: "15%",
                },
                {
                    id: "teams",
                    header: "Teams",
                    cell: (match) =>
                        match.assignments.map((assignment) => assignment.team?.shortName ?? "Unknown").join(", "),
                    width: "20%",
                },
                {
                    id: "actions",
                    header: "Actions",
                    cell: (match) => (
                        <Restricted permissions={{ competition: ["configure"] }}>
                            <SpaceBetween direction="horizontal" size="xs">
                                <DeleteMatchButton match={match} />
                            </SpaceBetween>
                        </Restricted>
                    ),
                },
            ]}
            columnDisplay={[
                { id: "name", visible: true },
                { id: "type", visible: true },
                {
                    id: "status",
                    visible: !!competitionClock,
                },
                ...["sequenceNumber", "teams", "actions"].map((id) => ({ id, visible: true })),
            ]}
            {...collectionProps}
            pagination={<Pagination {...paginationProps} />}
        />
    );
}

