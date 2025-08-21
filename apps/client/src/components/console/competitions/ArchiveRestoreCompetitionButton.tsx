import { Box, Button, Header, Modal, SpaceBetween } from "@cloudscape-design/components";
import { useState } from "react";
import { api } from "../../../utils/trpc";
import { Competition } from "@livecomp/server/src/db/schema/competitions";

export default function ArchiveRestoreCompetitionButton({ competition }: { competition: Competition }) {
    const [modalVisible, setModalVisible] = useState(false);

    const { mutate: updateCompetition } = api.competitions.update.useMutation({
        onSuccess: async () => {
            setModalVisible(false);
        },
    });

    const verb = competition.archivedAt ? "Restore" : "Archive";

    return (
        <>
            <Button variant="normal" onClick={() => setModalVisible(true)}>
                {verb}
            </Button>

            <Modal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                header={<Header>{verb} competition</Header>}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button
                                variant="primary"
                                onClick={() =>
                                    updateCompetition({
                                        id: competition.id,
                                        data: { archivedAt: competition.archivedAt ? null : new Date() },
                                    })
                                }
                            >
                                Confirm
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <SpaceBetween size="s">
                    <span>
                        {verb} <b>{competition.name}</b>?
                    </span>
                </SpaceBetween>
            </Modal>
        </>
    );
}

