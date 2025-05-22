import { Box, Button, Header, Modal, SpaceBetween } from "@cloudscape-design/components";
import { useState } from "react";
import { api } from "../../../utils/trpc";
import { Display } from "@livecomp/server/src/db/schema/displays";

export default function DeleteDisplayButton({ display }: { display: Display }) {
    const [modalVisible, setModalVisible] = useState(false);

    const { mutate: deleteDisplay } = api.displays.delete.useMutation({
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
                header={<Header>Delete display</Header>}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => deleteDisplay({ id: display.id })}>
                                Confirm
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <SpaceBetween size="s">
                    <span>
                        Permanently delete display <b>{display.name}</b>? You can't undo this action.
                    </span>
                </SpaceBetween>
            </Modal>
        </>
    );
}

