import { createFileRoute } from "@tanstack/react-router";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { Alert, ContentLayout, Header, SpaceBetween, Table } from "@cloudscape-design/components";
import { RoutedLink } from "../../components/console/util/RoutedLink";
import Restricted from "../../components/console/util/Restricted";
import { authClient, User } from "@livecomp/shared";
import { useQuery } from "@tanstack/react-query";
import DeleteUserButton from "../../components/console/users/DeleteUserButton";
import CreateUserModalButton from "../../components/console/users/CreateUserModalButton";
import RevokeAllSessionsButton from "../../components/console/users/RevokeAllSessionsButton";

export const Route = createFileRoute("/console/users/")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Manage users",
    }),
});

function RouteComponent() {
    const { data, isError, isPending } = useQuery({
        queryKey: ["users", "list"],
        queryFn: () => authClient.admin.listUsers({ query: { limit: 100 } }),
    });

    const { items, collectionProps } = useCollection((data?.data?.users ?? []) as User[], {});

    return (
        <ContentLayout header={<Header variant="h1">Manage users</Header>}>
            <Restricted permissions={{ user: ["list"] }}>
                <Table
                    header={
                        <Header
                            actions={
                                <SpaceBetween direction="horizontal" size="s">
                                    <Restricted permissions={{ user: ["create"] }}>
                                        <CreateUserModalButton />
                                    </Restricted>
                                </SpaceBetween>
                            }
                        >
                            Users
                        </Header>
                    }
                    loading={isPending}
                    loadingText="Loading users"
                    items={items}
                    columnDefinitions={[
                        {
                            id: "email",
                            header: "Email",
                            cell: (user) => (
                                <RoutedLink to="/console/users/$userId" params={{ userId: user.id }}>
                                    {user.email}
                                </RoutedLink>
                            ),
                        },
                        {
                            id: "name",
                            header: "Name",
                            cell: (user) => user.name,
                        },
                        {
                            id: "role",
                            header: "Role",
                            cell: (user) => user.role,
                        },
                        {
                            id: "actions",
                            header: "Actions",
                            cell: (user) => (
                                <SpaceBetween direction="horizontal" size="s">
                                    <RevokeAllSessionsButton user={user} />
                                    <DeleteUserButton user={user} />
                                </SpaceBetween>
                            ),
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

