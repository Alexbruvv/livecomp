import { Box, Button, Header, Modal, SpaceBetween } from "@cloudscape-design/components";
import { useState } from "react";
import type { StartingZone } from "@livecomp/server/src/db/schema/games";
import { api } from "../../../utils/trpc";

export default function DeleteStartingZoneButton({ startingZone }: { startingZone: StartingZone }) {
    const [modalVisible, setModalVisible] = useState(false);

    const { mutate: deleteStartingZone } = api.startingZones.delete.useMutation({
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
                header={<Header>Delete starting zone</Header>}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => deleteStartingZone({ id: startingZone.id })}>
                                Confirm
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <SpaceBetween size="s">
                    <span>
                        Permanently delete <b>starting zone {startingZone.name}</b>? You can't undo this action.
                    </span>
                </SpaceBetween>
            </Modal>
        </>
    );
}

