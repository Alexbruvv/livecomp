import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../utils/trpc";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { Alert, ContentLayout, Header, SpaceBetween, Table } from "@cloudscape-design/components";
import { RoutedLink } from "../../components/console/util/RoutedLink";
import Restricted from "../../components/console/util/Restricted";
import DeleteUserButton from "../../components/console/users/DeleteUserButton";
import CreateUserModalButton from "../../components/console/users/CreateUserModalButton";

export const Route = createFileRoute("/console/users/")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Manage users",
    }),
});

function RouteComponent() {
    const { data: users, isPending, isError } = api.users.fetchAll.useQuery();

    const { items, collectionProps } = useCollection(users ?? [], {});

    return (
        <ContentLayout header={<Header variant="h1">Manage users</Header>}>
            <Restricted role="sysadmin">
                <Table
                    header={
                        <Header
                            actions={
                                <SpaceBetween direction="horizontal" size="s">
                                    <CreateUserModalButton />
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
                            id: "username",
                            header: "Username",
                            cell: (user) => (
                                <RoutedLink to="/console/users/$userId" params={{ userId: user.id }}>
                                    {user.username}
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
                            cell: (user) => (
                                <SpaceBetween direction="horizontal" size="s">
                                    <DeleteUserButton user={user} />
                                </SpaceBetween>
                            ),
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

