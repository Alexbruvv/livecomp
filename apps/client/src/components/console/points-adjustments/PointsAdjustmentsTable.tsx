import { useCollection } from "@cloudscape-design/collection-hooks";
import { Table, Header, SpaceBetween, Pagination } from "@cloudscape-design/components";
import Restricted from "../util/Restricted";
import { ManualPointsAdjustment } from "@livecomp/server";
import AddPointsAdjustmentModalButton from "./AddPointsAdjustmentModalButton";
import EditPointsAdjustmentModalButton from "./EditPointsAdjustmentModalButton";
import DeletePointsAdjustmentButton from "./DeletePointsAdjustmentButton";

export default function PointsAdjustmentsTable({
    pointsAdjustments,
    teamId,
}: {
    pointsAdjustments: ManualPointsAdjustment[];
    teamId: string;
}) {
    const { items, collectionProps, paginationProps } = useCollection(pointsAdjustments, {
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

    return (
        <Table
            header={
                <Header
                    actions={
                        <Restricted permissions={{ competition: ["score"] }}>
                            <SpaceBetween size="s" direction="horizontal">
                                <AddPointsAdjustmentModalButton teamId={teamId} />
                            </SpaceBetween>
                        </Restricted>
                    }
                    counter={`(${pointsAdjustments.length})`}
                >
                    Points Adjustments
                </Header>
            }
            items={items}
            columnDefinitions={[
                {
                    id: "leaguePointsChange",
                    header: "League Points Change",
                    cell: (adjustment) =>
                        adjustment.leaguePoints > 0 ? `+${adjustment.leaguePoints}` : adjustment.leaguePoints,
                    width: "15%",
                },
                {
                    id: "reason",
                    header: "Reason",
                    cell: (adjustment) => adjustment.reason,
                    width: "60%",
                },
                {
                    id: "actions",
                    header: "Actions",
                    cell: (adjustment) => (
                        <Restricted permissions={{ competition: ["score"] }}>
                            <SpaceBetween direction="horizontal" size="xs">
                                <EditPointsAdjustmentModalButton pointsAdjustment={adjustment} />
                                <DeletePointsAdjustmentButton pointsAdjustment={adjustment} />
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

