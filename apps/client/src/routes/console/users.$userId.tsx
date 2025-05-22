import { ContentLayout, Header, SpaceBetween, Container, KeyValuePairs } from "@cloudscape-design/components";
import { createFileRoute } from "@tanstack/react-router";
import Restricted from "../../components/console/util/Restricted";
import { api } from "../../utils/trpc";
import EditUserModalButton from "../../components/console/users/EditUserModalButton";

export const Route = createFileRoute("/console/users/$userId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { userId } = Route.useParams();

    const { data: user } = api.users.fetchById.useQuery({ id: userId });

    return (
        <ContentLayout header={<Header variant="h1">{user?.name ?? "..."}</Header>}>
            <SpaceBetween size="s">
                <Container
                    header={
                        <Header
                            actions={
                                <Restricted role="sysadmin">
                                    <SpaceBetween direction="horizontal" size="xs">
                                        {user && <EditUserModalButton user={user} />}
                                    </SpaceBetween>
                                </Restricted>
                            }
                        >
                            General
                        </Header>
                    }
                >
                    <KeyValuePairs
                        columns={3}
                        items={[
                            {
                                label: "Username",
                                value: user?.username ?? "...",
                            },
                            {
                                label: "Name",
                                value: user?.name ?? "...",
                            },
                            {
                                label: "Role",
                                value: user?.role ?? "...",
                            },
                        ]}
                    />
                </Container>
            </SpaceBetween>
        </ContentLayout>
    );
}

