import { Alert, Box, Button, Header, Modal, SpaceBetween } from "@cloudscape-design/components";
import { useState } from "react";
import { api } from "../../../utils/trpc";
import { MatchPeriod } from "@livecomp/server/src/db/schema/matches";

export default function DeleteMatchPeriodButton({ matchPeriod }: { matchPeriod: MatchPeriod }) {
    const [modalVisible, setModalVisible] = useState(false);

    const { mutate: deleteMatchPeriod } = api.matchPeriods.delete.useMutation({
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
                header={<Header>Delete match period</Header>}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => deleteMatchPeriod({ id: matchPeriod.id })}>
                                Confirm
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <SpaceBetween size="s">
                    <span>
                        Permanently delete <b>{matchPeriod.name}</b>? You can't undo this action.
                    </span>
                    <Alert>
                        This operation will fail if there is any data associated with this match period. This is for
                        safety reasons. Ensure there are no matches scheduled in this period before deleting it.
                    </Alert>
                </SpaceBetween>
            </Modal>
        </>
    );
}

