import { Alert, Box, Button, Header, Modal, SpaceBetween } from "@cloudscape-design/components";
import { useState } from "react";
import { api } from "../../../utils/trpc";
import { Venue } from "@livecomp/server/src/db/schema/venues";

export default function DeleteVenueButton({ venue }: { venue: Venue }) {
    const [modalVisible, setModalVisible] = useState(false);

    const { mutate: deleteVenue } = api.venues.delete.useMutation({
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
                header={<Header>Delete venue</Header>}
                footer={
                    <Box float="right">
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => deleteVenue({ id: venue.id })}>
                                Confirm
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            >
                <SpaceBetween size="s">
                    <span>
                        Permanently delete <b>{venue.name}</b>? You can't undo this action.
                    </span>
                    <Alert>
                        This will fail if competitions exist using this venue. To delete the venue, first ensure no
                        competitions are using it.
                    </Alert>
                </SpaceBetween>
            </Modal>
        </>
    );
}

