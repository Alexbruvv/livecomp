import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../utils/trpc";
import { ContentLayout, Header, Table, SpaceBetween, Box, Alert } from "@cloudscape-design/components";
import CreateGameModalButton from "../../components/console/games/CreateGameModalButton";
import DeleteGameButton from "../../components/console/games/DeleteGameButton";
import { RoutedLink } from "../../components/console/util/RoutedLink";
import Restricted from "../../components/console/util/Restricted";

export const Route = createFileRoute("/console/games/")({
    component: RouteComponent,
    beforeLoad: () => ({
        title: "Manage games",
    }),
});

function RouteComponent() {
    const { data: games, isPending, isError } = api.games.fetchAll.useQuery();

    return (
        <ContentLayout
            header={
                <Header
                    variant="h1"
                    description={
                        <>
                            Games are played between robots in matches. They contain starting zones as well as scoring
                            configurations.
                        </>
                    }
                >
                    Manage games
                </Header>
            }
        >
            <Table
                columnDefinitions={[
                    {
                        id: "name",
                        header: "Name",
                        width: "50%",
                        isRowHeader: true,
                        cell: (game) => (
                            <RoutedLink to="/console/games/$gameId" params={{ gameId: game.id }}>
                                {game.name}
                            </RoutedLink>
                        ),
                    },
                    {
                        id: "actions",
                        header: "Actions",
                        cell: (game) => (
                            <Restricted role="admin">
                                <SpaceBetween direction="horizontal" size="xs">
                                    <DeleteGameButton game={game} />
                                </SpaceBetween>
                            </Restricted>
                        ),
                    },
                ]}
                loading={isPending}
                loadingText="Loading games"
                items={games ?? []}
                header={
                    <Header
                        actions={
                            <Restricted role="admin">
                                <SpaceBetween size="xs">
                                    <CreateGameModalButton />
                                </SpaceBetween>
                            </Restricted>
                        }
                    >
                        Games
                    </Header>
                }
                empty={
                    isError ? (
                        <Alert type="error">Failed to load venues. Please try again later.</Alert>
                    ) : (
                        <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
                            <SpaceBetween size="m">
                                <b>No games</b>
                                <Restricted role="admin">
                                    <CreateGameModalButton />
                                </Restricted>
                            </SpaceBetween>
                        </Box>
                    )
                }
                enableKeyboardNavigation
            />
        </ContentLayout>
    );
}

