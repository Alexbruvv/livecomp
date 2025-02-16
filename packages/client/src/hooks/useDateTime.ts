import { CompetitionClock } from "@livecomp/utils";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";

export default function useDateTime(competitionClock?: CompetitionClock) {
    const getNow = useMemo(
        () => (competitionClock ? () => competitionClock.now() : () => DateTime.now()),
        [competitionClock]
    );

    const [now, setNow] = useState(getNow());

    useEffect(() => {
        let interval: Timer;
        const timeout = setTimeout(() => {
            interval = setInterval(() => {
                setNow(getNow());
            }, 1050);
        }, 1000 - now.millisecond);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getNow]);

    return now;
}

