import { useCollection } from "@cloudscape-design/collection-hooks";
import { Table, Header, SpaceBetween, Pagination } from "@cloudscape-design/components";
import { Competition } from "@livecomp/server/src/db/schema/competitions";
import { Team } from "@livecomp/server/src/db/schema/teams";
import CreateTeamModalButton from "./CreateTeamModalButton";
import { api } from "../../../utils/trpc";
import { Region } from "@livecomp/server/src/db/schema/venues";
import { RoutedLink } from "../util/RoutedLink";
import DeleteTeamButton from "./DeleteTeamButton";
import Restricted from "../util/Restricted";
import GenerateTeamsModalButton from "../competitions/GenerateTeamsModalButton";

export default function TeamsTable({
    teams,
    teamsPending,
    competition,
}: {
    teams: Team[] | undefined;
    teamsPending: boolean;
    competition: Competition;
}) {
    const { items, collectionProps, paginationProps } = useCollection(teams ?? [], {
        sorting: {
            defaultState: {
                sortingColumn: {
                    sortingField: "shortName",
                },
            },
        },
        pagination: {
            pageSize: 5,
        },
    });

    const { data: regions } = api.regions.fetchAll.useQuery({ filters: { venueId: competition.venueId } });
    const regionsById = (regions ?? []).reduce(
        (acc, region) => {
            acc[region.id] = region;
            return acc;
        },
        {} as Record<string, Region>
    );

    return (
        <Table
            header={
                <Header
                    actions={
                        <Restricted role="admin">
                            <SpaceBetween size="s" direction="horizontal">
                                <GenerateTeamsModalButton competitionId={competition.id} />
                                <CreateTeamModalButton competition={competition} />
                            </SpaceBetween>
                        </Restricted>
                    }
                    counter={`(${teams?.length ?? "..."})`}
                >
                    Teams
                </Header>
            }
            loading={teamsPending}
            loadingText={"Loading teams"}
            items={items}
            columnDefinitions={[
                {
                    id: "shortName",
                    header: "Short name",
                    cell: (team) => team.shortName,
                    width: "15%",
                },
                {
                    id: "name",
                    header: "Name",
                    cell: (team) => (
                        <RoutedLink
                            to="/console/competitions/$competitionId/teams/$teamId"
                            params={{ competitionId: competition.id, teamId: team.id }}
                        >
                            {team.name}
                        </RoutedLink>
                    ),
                    width: "30%",
                },
                {
                    id: "region",
                    header: "Region",
                    cell: (team) => regionsById[team.regionId]?.name ?? "...",
                    width: "30%",
                },
                {
                    id: "actions",
                    header: "Actions",
                    cell: (team) => (
                        <Restricted role="admin">
                            <SpaceBetween direction="horizontal" size="xs">
                                <DeleteTeamButton team={team} />
                            </SpaceBetween>
                        </Restricted>
                    ),
                },
            ]}
            {...collectionProps}
            pagination={<Pagination {...paginationProps} />}
        />
    );
}

