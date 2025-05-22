import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Alert, ContentLayout, Header, Link, SpaceBetween, Table } from "@cloudscape-design/components";
import CreateCompetitionModalButton from "../../components/console/competitions/CreateCompetitionModalButton";
import { api } from "../../utils/trpc";
import { useCollection } from "@cloudscape-design/collection-hooks";
import DeleteCompetitionButton from "../../components/console/competitions/DeleteCompetitionButton";
import Restricted from "../../components/console/util/Restricted";

export const Route = createFileRoute("/console/competitions/")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Manage competitions",
    }),
});

function RouteComponent() {
    const navigate = useNavigate();

    const { data: competitions, isPending, isError } = api.competitions.fetchAll.useQuery();
    const { items, collectionProps } = useCollection(competitions ?? [], {});

    return (
        <ContentLayout header={<Header variant="h1">Manage competitions</Header>}>
            <Table
                header={
                    <Header
                        actions={
                            <SpaceBetween size="s">
                                <Restricted role="admin">
                                    <CreateCompetitionModalButton />
                                </Restricted>
                            </SpaceBetween>
                        }
                    >
                        Competitions
                    </Header>
                }
                loading={isPending}
                loadingText="Loading competitions"
                items={items}
                columnDefinitions={[
                    {
                        id: "shortName",
                        header: "Short name",
                        cell: (competition) => competition.shortName,
                        width: "20%",
                    },
                    {
                        id: "name",
                        header: "Name",
                        cell: (competition) => (
                            <Link
                                href="#"
                                variant="primary"
                                onFollow={(e) => {
                                    e.preventDefault();
                                    navigate({
                                        to: "/console/competitions/$competitionId",
                                        params: { competitionId: competition.id },
                                    });
                                }}
                            >
                                {competition.name}
                            </Link>
                        ),
                        width: "50%",
                    },
                    {
                        id: "actions",
                        header: "Actions",
                        cell: (competition) => (
                            <Restricted role="admin">
                                <SpaceBetween direction="horizontal" size="xs">
                                    <DeleteCompetitionButton competition={competition} />
                                </SpaceBetween>
                            </Restricted>
                        ),
                    },
                ]}
                {...collectionProps}
                empty={
                    isError ? (
                        <Alert type="error">Failed to load competitions. Please try again later.</Alert>
                    ) : undefined
                }
            />
        </ContentLayout>
    );
}

