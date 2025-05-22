import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../../utils/trpc";
import { Button, Header, SpaceBetween, StatusIndicator, Table } from "@cloudscape-design/components";
import { competitionChecks } from "@livecomp/utils";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/console/competitions/$competitionId/checks")({
    component: RouteComponent,
});

function RouteComponent() {
    const { competitionId } = Route.useParams();
    const { data: competition, isPending: competitionPending } = api.competitions.fetchById.useQuery({
        id: competitionId,
    });

    const utils = api.useUtils();
    const [refreshPending, setRefreshPending] = useState(false);

    const checks = useMemo(
        () =>
            competition
                ? competitionChecks.map((check) => ({
                      ...check,
                      result: check.check(competition),
                  }))
                : [],
        [competition]
    );

    return (
        <Table
            header={
                <Header
                    actions={
                        <SpaceBetween direction="horizontal" size="s">
                            <Button
                                variant="normal"
                                iconName="refresh"
                                loading={refreshPending}
                                onClick={async () => {
                                    setRefreshPending(true);
                                    await utils.competitions.fetchById.invalidate({ id: competitionId });
                                    setRefreshPending(false);
                                }}
                            >
                                Refresh
                            </Button>
                        </SpaceBetween>
                    }
                >
                    Competition checks
                </Header>
            }
            items={checks}
            loading={competitionPending}
            columnDefinitions={[
                {
                    id: "id",
                    header: "ID",
                    cell: (check) => check.identifier,
                },
                {
                    id: "description",
                    header: "Description",
                    cell: (check) => check.description,
                },
                {
                    id: "result",
                    header: "Result",
                    cell: (check) =>
                        check.result.success ? (
                            <StatusIndicator type="success">Passed</StatusIndicator>
                        ) : (
                            <StatusIndicator type="warning">Failed</StatusIndicator>
                        ),
                },
                {
                    id: "details",
                    header: "Details",
                    cell: (check) => (!check.result.success ? check.result.message : undefined),
                },
            ]}
        />
    );
}

