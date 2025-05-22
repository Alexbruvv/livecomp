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
} from "@cloudscape-design/components";
import EditGameModalButton from "../../components/console/games/EditGameModalButton";
import Restricted from "../../components/console/util/Restricted";
import CreateStartingZoneModalButton from "../../components/console/startingZones/CreateStartingZoneModalButton";
import DeleteStartingZoneButton from "../../components/console/startingZones/DeleteStartingZoneButton";
import EditStartingZoneModalButton from "../../components/console/startingZones/EditStartingZoneModalButton";

export const Route = createFileRoute("/console/games/$gameId")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Manage game",
    }),
});

function RouteComponent() {
    const { gameId: id } = Route.useParams();

    const { data: game } = api.games.fetchById.useQuery({ id: id });
    const { data: startingZones, isPending: startingZonesPending } = api.startingZones.fetchAll.useQuery({
        filters: {
            gameId: id,
        },
    });

    if (!id) {
        return <Navigate to="/console/games" />;
    }

    return (
        <ContentLayout header={<Header variant="h1">{game?.name ?? "..."}</Header>}>
            <SpaceBetween size="s">
                <Container
                    header={
                        <Header
                            actions={
                                <Restricted role="admin">
                                    <SpaceBetween direction="horizontal" size="xs">
                                        {game && <EditGameModalButton game={game} />}
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
                                label: "Name",
                                value: game?.name ?? "...",
                            },
                            {
                                label: "Match duration",
                                value: game?.matchDuration ?? "...",
                            },
                            {
                                label: "Default match spacing",
                                value: game?.defaultMatchSpacing ?? "...",
                            },
                            {
                                label: "Staging open offset",
                                value: game?.stagingOpenOffset ?? "...",
                            },
                            {
                                label: "Staging close offset",
                                value: game?.stagingCloseOffset ?? "...",
                            },
                            {
                                label: "Scorer",
                                value: game ? (game.scorer ?? "None") : "...",
                            },
                        ]}
                    />
                </Container>

                <Table
                    header={
                        <Header
                            actions={
                                <Restricted role="admin">
                                    <SpaceBetween direction="horizontal" size="xs">
                                        {game && <CreateStartingZoneModalButton gameId={game.id} />}
                                    </SpaceBetween>
                                </Restricted>
                            }
                        >
                            Starting zones
                        </Header>
                    }
                    items={startingZones ?? []}
                    columnDefinitions={[
                        {
                            id: "name",
                            header: "Name",
                            cell: (startingZone) => startingZone.name,
                            width: "30%",
                        },
                        {
                            id: "color",
                            header: "Color",
                            cell: (startingZone) => startingZone.color,
                            width: "30%",
                        },
                        {
                            id: "actions",
                            header: "Actions",
                            cell: (startingZone) => (
                                <Restricted role="admin">
                                    <SpaceBetween direction="horizontal" size="xs">
                                        <EditStartingZoneModalButton startingZone={startingZone} />
                                        <DeleteStartingZoneButton startingZone={startingZone} />
                                    </SpaceBetween>
                                </Restricted>
                            ),
                        },
                    ]}
                    empty={
                        <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
                            <SpaceBetween size="m">
                                <b>No starting zones</b>
                                <Restricted role="admin">
                                    {game && <CreateStartingZoneModalButton gameId={game.id} />}
                                </Restricted>
                            </SpaceBetween>
                        </Box>
                    }
                    loading={startingZonesPending}
                />
            </SpaceBetween>
        </ContentLayout>
    );
}

