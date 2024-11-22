import { createFileRoute, Navigate } from "@tanstack/react-router";
import { api } from "../../utils/trpc";
import {
    ContentLayout,
    Header,
    SpaceBetween,
    Container,
    KeyValuePairs,
    Table,
    Box,
    Alert,
} from "@cloudscape-design/components";
import EditVenueModalButton from "../../components/console/venues/EditVenueModalButton";
import CreateRegionModalButton from "../../components/console/venues/regions/CreateRegionModalButton";
import DeleteRegionButton from "../../components/console/venues/regions/DeleteRegionButton";
import EditRegionModalButton from "../../components/console/venues/regions/EditRegionModalButton";
import CreateShepherdModalButton from "../../components/console/venues/shepherds/CreateShepherdModalButton";
import DeleteShepherdButton from "../../components/console/venues/shepherds/DeleteShepherdButton";
import EditShepherdModalButton from "../../components/console/venues/shepherds/EditShepherdModalButton";

export const Route = createFileRoute("/console/venues/$venueId")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Manage venue",
    }),
});

function RouteComponent() {
    const { venueId: id } = Route.useParams();

    const { data: venue } = api.venues.fetchById.useQuery({ id });
    const {
        data: regions,
        isPending: regionsPending,
        isError: regionsError,
    } = api.regions.fetchAll.useQuery({ filters: { venueId: id } });
    const {
        data: shepherds,
        isPending: shepherdsPending,
        isError: shepherdsError,
    } = api.shepherds.fetchAll.useQuery({
        filters: { venueId: id },
    });

    if (!id) {
        return <Navigate to="/console/venues" />;
    }

    return (
        <ContentLayout header={<Header variant="h1">{venue?.name ?? "..."}</Header>}>
            <SpaceBetween size="s">
                <Container
                    header={
                        <Header
                            actions={
                                <SpaceBetween direction="horizontal" size="xs">
                                    {venue && <EditVenueModalButton venue={venue} />}
                                </SpaceBetween>
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
                                label: "Name",
                                value: venue?.name ?? "...",
                            },
                        ]}
                    />
                </Container>

                <Table
                    header={
                        <Header
                            actions={
                                <SpaceBetween direction="horizontal" size="xs">
                                    {venue && <CreateRegionModalButton venueId={venue.id} />}
                                </SpaceBetween>
                            }
                            description="Regions are areas within the venue in which team pits are located."
                        >
                            Regions
                        </Header>
                    }
                    items={regions ?? []}
                    columnDefinitions={[
                        {
                            id: "name",
                            header: "Name",
                            cell: (region) => region.name,
                            width: "50%",
                        },
                        {
                            id: "actions",
                            header: "Actions",
                            cell: (region) => (
                                <SpaceBetween direction="horizontal" size="xs">
                                    <EditRegionModalButton region={region} />
                                    <DeleteRegionButton region={region} />
                                </SpaceBetween>
                            ),
                        },
                    ]}
                    empty={
                        regionsError ? (
                            <Alert type="error">Failed to load regions. Please try again later.</Alert>
                        ) : (
                            <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
                                <SpaceBetween size="m">
                                    <b>No regions</b>
                                    {venue && <CreateRegionModalButton venueId={venue.id} />}
                                </SpaceBetween>
                            </Box>
                        )
                    }
                    loading={regionsPending}
                    getLoadingStatus={() => "error"}
                />

                <Table
                    header={
                        <Header
                            actions={
                                <SpaceBetween direction="horizontal" size="xs">
                                    {venue && regions && (
                                        <CreateShepherdModalButton venueId={venue.id} regions={regions} />
                                    )}
                                </SpaceBetween>
                            }
                            description="Shepherds are responsible for managing the team pits in one or more regions."
                        >
                            Shepherds
                        </Header>
                    }
                    items={shepherds ?? []}
                    columnDefinitions={[
                        {
                            id: "name",
                            header: "Name",
                            cell: (shepherd) => shepherd.name,
                            width: "50%",
                        },
                        {
                            id: "actions",
                            header: "Actions",
                            cell: (shepherd) => (
                                <SpaceBetween direction="horizontal" size="xs">
                                    {regions && <EditShepherdModalButton shepherd={shepherd} regions={regions} />}
                                    {<DeleteShepherdButton shepherd={shepherd} />}
                                </SpaceBetween>
                            ),
                        },
                    ]}
                    empty={
                        shepherdsError ? (
                            <Alert type="error">Failed to load shepherds. Please try again later.</Alert>
                        ) : (
                            <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
                                <SpaceBetween size="m">
                                    <b>No shepherds</b>
                                    {venue && regions && (
                                        <CreateShepherdModalButton venueId={venue.id} regions={regions} />
                                    )}
                                </SpaceBetween>
                            </Box>
                        )
                    }
                    loading={shepherdsPending}
                />
            </SpaceBetween>
        </ContentLayout>
    );
}

