import { useCollection } from "@cloudscape-design/collection-hooks";
import {
    Table,
    Header,
    SpaceBetween,
    Pagination,
    StatusIndicator,
    Button,
    ButtonDropdown,
} from "@cloudscape-design/components";
import Restricted from "../util/Restricted";
import { AppRouterOutput } from "@livecomp/server";
import EditDisplayModalButton from "./EditDisplayModalButton";
import { api } from "../../../utils/trpc";
import DeleteDisplayButton from "./DeleteDisplayButton";

export default function DisplaysTable({
    displays,
    displaysPending,
    competitionId,
}: {
    displays: AppRouterOutput["displays"]["fetchAll"] | undefined;
    displaysPending: boolean;
    competitionId: string;
}) {
    const { data: competition } = api.competitions.fetchById.useQuery({ id: competitionId });
    const { mutate: updateCompetition, isPending: updateCompetitionPending } = api.competitions.update.useMutation();

    const { mutate: refreshDisplays, isPending: refreshDisplaysPending } = api.displays.refresh.useMutation();

    const { items, collectionProps, paginationProps } = useCollection(displays ?? [], {
        sorting: {
            defaultState: {
                sortingColumn: {
                    sortingField: "identifier",
                },
            },
        },
        pagination: {
            pageSize: 10,
        },
        selection: {},
    });

    const { selectedItems } = collectionProps;

    return (
        <Table
            header={
                <Header
                    actions={
                        <Restricted role="admin">
                            <SpaceBetween size="s" direction="horizontal">
                                {selectedItems?.length ? (
                                    <ButtonDropdown
                                        items={[{ id: "refresh", text: "Refresh", iconName: "refresh" }]}
                                        onItemClick={(e) => {
                                            if (e.detail.id === "refresh") {
                                                refreshDisplays({ ids: selectedItems.map((item) => item.id) });
                                            }
                                        }}
                                        loading={refreshDisplaysPending}
                                    >
                                        Control
                                    </ButtonDropdown>
                                ) : (
                                    <></>
                                )}
                                {competition && (
                                    <Button
                                        loading={updateCompetitionPending}
                                        onClick={() =>
                                            updateCompetition({
                                                id: competitionId,
                                                data: { acceptingNewDisplays: !competition.acceptingNewDisplays },
                                            })
                                        }
                                    >
                                        Toggle pairing mode
                                    </Button>
                                )}
                            </SpaceBetween>
                        </Restricted>
                    }
                    counter={selectedItems?.length ? `(${selectedItems.length}/${items.length})` : `(${items.length})`}
                    description={
                        competition ? (
                            competition.acceptingNewDisplays ? (
                                <StatusIndicator type="success">Accepting new displays</StatusIndicator>
                            ) : (
                                <StatusIndicator type="stopped">Not accepting new displays</StatusIndicator>
                            )
                        ) : (
                            "..."
                        )
                    }
                >
                    Displays
                </Header>
            }
            loading={displaysPending}
            loadingText={"Loading displays"}
            items={items}
            selectionType="multi"
            columnDefinitions={[
                {
                    id: "identifier",
                    header: "Identifier",
                    cell: (display) => display.identifier,
                    width: "20%",
                },
                {
                    id: "name",
                    header: "Name",
                    cell: (display) => display.name,
                    width: "20%",
                },
                {
                    id: "mode",
                    header: "Mode",
                    cell: (display) => display.configuration.mode,
                    width: "15%",
                },
                {
                    id: "status",
                    header: "Status",
                    cell: (display) => (
                        <StatusIndicator type={display.online ? "success" : "stopped"}>
                            {display.online ? "Online" : "Offline"}
                        </StatusIndicator>
                    ),
                },
                {
                    id: "actions",
                    header: "Actions",
                    cell: (display) => (
                        <Restricted role="admin">
                            <SpaceBetween direction="horizontal" size="xs">
                                <EditDisplayModalButton display={display} />
                                <DeleteDisplayButton display={display} />
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

