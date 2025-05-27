import {
    ContentLayout,
    Header,
    SpaceBetween,
    Container,
    KeyValuePairs,
    Table,
    Popover,
} from "@cloudscape-design/components";
import { authClient } from "@livecomp/shared";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/console/users/$userId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { userId } = Route.useParams();
    const { data: userQueryData } = useQuery({
        queryKey: ["users", "fetch", userId],
        queryFn: () =>
            authClient.admin.listUsers({
                query: {
                    filterField: "id",
                    filterOperator: "eq",
                    filterValue: userId,
                },
            }),
    });
    const { data: sessionsData } = useQuery({
        queryKey: ["users", "sessions", userId],
        queryFn: () =>
            authClient.admin.listUserSessions({
                userId,
            }),
    });

    const user = useMemo(() => userQueryData?.data?.users[0] ?? null, [userQueryData]);
    const sessions = useMemo(() => sessionsData?.data?.sessions ?? [], [sessionsData]);

    return (
        <ContentLayout header={<Header variant="h1">{user?.name ?? "..."}</Header>}>
            <SpaceBetween size="s">
                <Container
                    header={
                        <Header actions={<SpaceBetween direction="horizontal" size="xs"></SpaceBetween>}>
                            General
                        </Header>
                    }
                >
                    <KeyValuePairs
                        columns={3}
                        items={[
                            {
                                label: "Email",
                                value: user?.email || "...",
                            },
                            {
                                label: "Name",
                                value: user?.name || "...",
                            },
                            {
                                label: "Role",
                                value: user?.role || "...",
                            },
                        ]}
                    />
                </Container>

                <Table
                    header={<Header description="Click to view the user agent">Sessions</Header>}
                    items={sessions}
                    columnDefinitions={[
                        {
                            id: "id",
                            header: "ID",
                            cell: (session) => (
                                <Popover
                                    position="top"
                                    size="medium"
                                    content={session.userAgent ?? "Unknown user agent"}
                                >
                                    {session.id}
                                </Popover>
                            ),
                        },
                        {
                            id: "createdAt",
                            header: "Created at",
                            cell: (session) => new Date(session.createdAt).toLocaleString(),
                        },
                        {
                            id: "expiresAt",
                            header: "Expires at",
                            cell: (session) => new Date(session.expiresAt).toLocaleString(),
                        },
                    ]}
                />
            </SpaceBetween>
        </ContentLayout>
    );
}

