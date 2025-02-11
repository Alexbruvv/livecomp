import { Button, FormField, Modal, SegmentedControl, Select, SpaceBetween } from "@cloudscape-design/components";
import { AppRouterOutput } from "@livecomp/server";
import { useMemo, useState } from "react";
import { showFlashbar } from "../../../../state/flashbars";
import { ExcludeNull } from "../../../../utils/types";
import { api } from "../../../../utils/trpc";
import useCompetitionClock from "../../../../hooks/useCompetitionClock";
import { DateTime } from "luxon";

const OFFSET_OPTIONS = [15, 30, 45, 60].map((t) => ({ id: `${t}`, text: `${t} seconds` }));
const DIRECTION_OPTIONS = ["Before", "After"].map((d) => ({ id: d.toLowerCase(), text: d }));

export default function OffsetCursorModalButton({
    competition,
}: {
    competition: ExcludeNull<AppRouterOutput["competitions"]["fetchById"]>;
}) {
    const [visible, setVisible] = useState(false);

    const competitionClock = useCompetitionClock(competition);

    const matchOptions = useMemo(
        () => competition.matches.map((match) => ({ value: match.id, label: match.name })),
        [competition]
    );

    const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
    const [selectedOffset, setSelectedOffset] = useState(OFFSET_OPTIONS[0].id);
    const [selectedDirection, setSelectedDirection] = useState(DIRECTION_OPTIONS[0].id);

    const { mutate: offset, isPending: offsetPending } = api.competitions.offset.useMutation({
        onError: (e) => {
            showFlashbar({ type: "error", content: e.message });
        },
        onSettled: () => {
            setVisible(false);

            setSelectedMatch(null);
            setSelectedOffset(OFFSET_OPTIONS[0].id);
            setSelectedDirection(DIRECTION_OPTIONS[0].id);
        },
    });

    const onSubmit = () => {
        if (!selectedMatch) {
            showFlashbar({ type: "error", content: "Please select a match" });
            setVisible(false);
            return;
        }

        const targetMatchStart = competitionClock.getMatchTimings(selectedMatch)?.startsAt;

        if (!targetMatchStart) {
            showFlashbar({ type: "error", content: "Match not scheduled" });
            setVisible(false);
            return;
        }

        const now = DateTime.now();

        const offsetValue =
            Math.abs(now.diff(targetMatchStart).as("seconds")) * (now > targetMatchStart ? -1 : 1) +
            parseInt(selectedOffset) * (selectedDirection === "before" ? -1 : 1);

        offset({
            id: competition.id,
            offset: Math.round(offsetValue),
        });
    };

    return (
        <>
            <Button
                iconName="upload-download"
                fullWidth
                onClick={() => setVisible(true)}
                disabled={competitionClock.isPaused()}
            >
                Offset cursor
            </Button>

            <Modal header="Move cursor" visible={visible} onDismiss={() => setVisible(false)}>
                <SpaceBetween size="s">
                    <FormField label="Offset">
                        <SpaceBetween size="xs">
                            <SegmentedControl
                                options={OFFSET_OPTIONS}
                                selectedId={selectedOffset}
                                onChange={(e) => setSelectedOffset(e.detail.selectedId)}
                            />
                            <SegmentedControl
                                options={DIRECTION_OPTIONS}
                                selectedId={selectedDirection}
                                onChange={(e) => setSelectedDirection(e.detail.selectedId)}
                            />
                        </SpaceBetween>
                    </FormField>

                    <FormField label="Relative to start of">
                        <Select
                            selectedOption={matchOptions.find((option) => option.value === selectedMatch) ?? null}
                            options={matchOptions}
                            onChange={(e) => setSelectedMatch(e.detail.selectedOption.value ?? null)}
                        />
                    </FormField>

                    <Button onClick={onSubmit} loading={offsetPending}>
                        Offset cursor
                    </Button>
                </SpaceBetween>
            </Modal>
        </>
    );
}

