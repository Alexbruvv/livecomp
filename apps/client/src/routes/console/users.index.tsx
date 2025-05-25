import { createFileRoute } from "@tanstack/react-router";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { Alert, ContentLayout, Header, SpaceBetween, Table } from "@cloudscape-design/components";
import { RoutedLink } from "../../components/console/util/RoutedLink";
import Restricted from "../../components/console/util/Restricted";
import { authClient } from "../../utils/auth";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/console/users/")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Manage users",
    }),
});

function RouteComponent() {
    const { data, isError } = useQuery({
        queryKey: ["users", "list"],
        queryFn: () => authClient.admin.listUsers({ query: { limit: 100 } }),
    });

    const { items, collectionProps } = useCollection(data?.data?.users ?? [], {});

    return (
        <ContentLayout header={<Header variant="h1">Manage users</Header>}>
            <Restricted permissions={{ user: ["list"] }}>
                <Table
                    header={
                        <Header actions={<SpaceBetween direction="horizontal" size="s"></SpaceBetween>}>Users</Header>
                    }
                    loading={true}
                    loadingText="Loading users"
                    items={items}
                    columnDefinitions={[
                        {
                            id: "username",
                            header: "Username",
                            cell: (user) => (
                                <RoutedLink to="/console/users/$userId" params={{ userId: user.id }}>
                                    USERNAMEHERE
                                </RoutedLink>
                            ),
                            width: "25%",
                        },
                        {
                            id: "name",
                            header: "Name",
                            cell: (user) => user.name,
                            width: "25%",
                        },
                        {
                            id: "role",
                            header: "Role",
                            cell: (user) => user.role,
                            width: "25%",
                        },
                        {
                            id: "actions",
                            header: "Actions",
                            cell: () => <SpaceBetween direction="horizontal" size="s"></SpaceBetween>,
                            width: "25%",
                        },
                    ]}
                    {...collectionProps}
                    empty={
                        isError ? <Alert type="error">Failed to load users. Please try again later.</Alert> : undefined
                    }
                />
            </Restricted>
        </ContentLayout>
    );
}

