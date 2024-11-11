import { Box, ContentLayout, Header, SpaceBetween, Table } from "@cloudscape-design/components";
import LivecompLayout from "../../components/layout/LivecompLayout";
import CreateGameModalButton from "../../components/games/CreateGameModalButton";
import { $api } from "../../modules/api";
import DeleteGameButton from "../../components/games/DeleteGameButton";

export default function GamesPage() {
    const { data, isPending } = $api.useQuery("get", "/games");

    return (
        <LivecompLayout breadcrumbItems={[{ text: "Games", href: "/games" }]}>
            <ContentLayout
                header={
                    <Header
                        variant="h1"
                        actions={
                            <SpaceBetween size="xs">
                                <CreateGameModalButton />
                            </SpaceBetween>
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
                            cell: (game) => game.name,
                        },
                        {
                            id: "actions",
                            header: "Actions",
                            cell: (game) => (
                                <SpaceBetween size="xs">
                                    <DeleteGameButton game={game} />
                                </SpaceBetween>
                            ),
                        },
                    ]}
                    loading={isPending}
                    loadingText="Loading games"
                    items={data?.games ?? []}
                    header={<Header>Games</Header>}
                    empty={
                        <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
                            <SpaceBetween size="m">
                                <b>No games</b>
                                <CreateGameModalButton />
                            </SpaceBetween>
                        </Box>
                    }
                    enableKeyboardNavigation
                />
            </ContentLayout>
        </LivecompLayout>
    );
}

