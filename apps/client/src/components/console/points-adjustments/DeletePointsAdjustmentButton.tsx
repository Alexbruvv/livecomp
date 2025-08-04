import { Box, Button, Header, Modal, SpaceBetween } from "@cloudscape-design/components";
import { useState } from "react";
import { api } from "../../../utils/trpc";
import { ManualPointsAdjustment } from "@livecomp/server";

export default function DeletePointsAdjustmentButton({
    pointsAdjustment,
}: {
    pointsAdjustment: ManualPointsAdjustment;
}) {
    const [modalVisible, setModalVisible] = useState(false);

    const { mutate: deletePointsAdjustment } = api.pointsAdjustments.delete.useMutation({
        onSuccess: async () => {
            setModalVisible(false);
        },
    });

    return (
        <>
            <Button onClick={() => setModalVisible(true)}>Delete</Button>

            <Modal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                header={<Header>Delete points adjustment</Header>}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button
                                variant="primary"
                                onClick={() => deletePointsAdjustment({ id: pointsAdjustment.id })}
                            >
                                Confirm
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <SpaceBetween size="s">
                    <span>Permanently delete this points adjustment? You can't undo this action.</span>
                </SpaceBetween>
            </Modal>
        </>
    );
}

