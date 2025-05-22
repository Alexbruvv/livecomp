import { useCollection } from "@cloudscape-design/collection-hooks";
import { Table, Header, SpaceBetween } from "@cloudscape-design/components";
import { Competition } from "@livecomp/server/src/db/schema/competitions";
import { MatchPeriod } from "@livecomp/server/src/db/schema/matches";
import CreateMatchPeriodModalButton from "./CreateMatchPeriodModalButton";
import DeleteMatchPeriodButton from "./DeleteMatchPeriodButton";
import { DateTime } from "luxon";
import { RoutedLink } from "../util/RoutedLink";
import Restricted from "../util/Restricted";

export default function MatchPeriodsTable({
    matchPeriods,
    matchPeriodsPending,
    competition,
}: {
    matchPeriods: MatchPeriod[] | undefined;
    matchPeriodsPending: boolean;
    competition: Competition;
}) {
    const { items, collectionProps } = useCollection(matchPeriods ?? [], {
        sorting: {
            defaultState: {
                sortingColumn: {
                    sortingField: "startsAt",
                },
            },
        },
    });

    return (
        <Table
            header={
                <Header
                    actions={
                        <Restricted role="admin">
                            <SpaceBetween size="s">
                                <CreateMatchPeriodModalButton competition={competition} />
                            </SpaceBetween>
                        </Restricted>
                    }
                    counter={`(${matchPeriods?.length ?? "..."})`}
                >
                    Match Periods
                </Header>
            }
            loading={matchPeriodsPending}
            loadingText={"Loading match periods"}
            items={items}
            columnDefinitions={[
                {
                    id: "name",
                    header: "Name",
                    cell: (matchPeriod) => (
                        <RoutedLink
                            to="/console/competitions/$competitionId/matchPeriods/$matchPeriodId"
                            params={{ competitionId: competition.id, matchPeriodId: matchPeriod.id }}
                        >
                            {matchPeriod.name}
                        </RoutedLink>
                    ),
                    width: "20%",
                },
                {
                    id: "startsAt",
                    header: "Starts at",
                    cell: (matchPeriod) =>
                        DateTime.fromJSDate(matchPeriod.startsAt).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
                    width: "30%",
                },
                {
                    id: "endsAt",
                    header: "Ends at",
                    cell: (matchPeriod) =>
                        DateTime.fromJSDate(matchPeriod.endsAt).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
                    width: "30%",
                },
                {
                    id: "actions",
                    header: "Actions",
                    cell: (matchPeriod) => (
                        <Restricted role="admin">
                            <SpaceBetween direction="horizontal" size="xs">
                                <DeleteMatchPeriodButton matchPeriod={matchPeriod} />
                            </SpaceBetween>
                        </Restricted>
                    ),
                },
            ]}
            {...collectionProps}
        />
    );
}

