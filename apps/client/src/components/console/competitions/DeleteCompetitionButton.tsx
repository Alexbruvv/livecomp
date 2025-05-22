import { Alert, Box, Button, Header, Modal, SpaceBetween } from "@cloudscape-design/components";
import { useState } from "react";
import { api } from "../../../utils/trpc";
import { Competition } from "@livecomp/server/src/db/schema/competitions";

export default function DeleteCompetitionButton({ competition }: { competition: Competition }) {
    const [modalVisible, setModalVisible] = useState(false);

    const { mutate: deleteCompetition } = api.competitions.delete.useMutation({
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
                header={<Header>Delete competition</Header>}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => deleteCompetition({ id: competition.id })}>
                                Confirm
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <SpaceBetween size="s">
                    <span>
                        Permanently delete <b>{competition.name}</b>? You can't undo this action.
                    </span>
                    <Alert>
                        This operation is likely to fail. There must be no data associated with this competition; this
                        includes teams and matches. This is for safety reasons, as competitions are the highest level of
                        data in the system.
                    </Alert>
                </SpaceBetween>
            </Modal>
        </>
    );
}

