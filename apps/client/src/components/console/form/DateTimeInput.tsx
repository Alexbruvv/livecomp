import { Grid, TimeInput, DatePicker } from "@cloudscape-design/components";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}:\d{2}$/;

export default function DateTimeInput({
    value,
    onChange,
}: {
    value: Date | undefined;
    onChange?: (e: CustomEvent<{ value: Date }>) => void;
}) {
    const [dateInput, setDateInput] = useState("");
    const [timeInput, setTimeInput] = useState("");

    const skipNextUpdate = useRef(false);

    useEffect(() => {
        skipNextUpdate.current = true;

        if (value) {
            setDateInput(DateTime.fromJSDate(value).toFormat("yyyy-MM-dd"));
            setTimeInput(DateTime.fromJSDate(value).toFormat("HH:mm:ss"));
        } else {
            setDateInput("");
            setTimeInput("");
        }
    }, [value]);

    useEffect(() => {
        if (skipNextUpdate.current) {
            skipNextUpdate.current = false;
            return;
        }

        if (DATE_PATTERN.test(dateInput) && TIME_PATTERN.test(timeInput)) {
            onChange?.(
                new CustomEvent("change", {
                    detail: {
                        value: DateTime.fromFormat(`${dateInput} ${timeInput}`, "yyyy-MM-dd HH:mm:ss").toJSDate(),
                    },
                })
            );
        }
    }, [dateInput, onChange, timeInput]);

    return (
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
            <DatePicker placeholder="YYYY/MM/DD" value={dateInput} onChange={(e) => setDateInput(e.detail.value)} />
            <TimeInput placeholder="HH:mm:ss" value={timeInput} onChange={(e) => setTimeInput(e.detail.value)} />
        </Grid>
    );
}

