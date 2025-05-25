import { ContentLayout, Header, SpaceBetween, Container, KeyValuePairs } from "@cloudscape-design/components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/console/users/$userId")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <ContentLayout header={<Header variant="h1">{"..."}</Header>}>
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
                                label: "Username",
                                value: "...",
                            },
                            {
                                label: "Name",
                                value: "...",
                            },
                            {
                                label: "Role",
                                value: "...",
                            },
                        ]}
                    />
                </Container>
            </SpaceBetween>
        </ContentLayout>
    );
}

