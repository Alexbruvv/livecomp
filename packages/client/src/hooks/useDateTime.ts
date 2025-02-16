import { CompetitionClock } from "@livecomp/utils";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";

export default function useDateTime(competitionClock?: CompetitionClock) {
    const determineOffsetMs = async () => {
        const now = performance.now();
        const isoServerDate = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/now`).then((response) =>
            response.text()
        );
        const delta = performance.now() - now;

        return DateTime.now().diff(DateTime.fromISO(isoServerDate)).milliseconds - delta / 2;
    };

    const [offsetMs, setOffsetMs] = useState(0);

    const getNow = useMemo(
        () =>
            competitionClock
                ? () => competitionClock.now().plus({ millisecond: offsetMs })
                : () => DateTime.now().plus({ millisecond: offsetMs }),
        [competitionClock, offsetMs]
    );

    const [now, setNow] = useState(getNow());

    useEffect(() => {
        let timeout: Timer;

        const tick = () => {
            const newNow = getNow();
            setNow(newNow);
            clearTimeout(timeout);
            timeout = setTimeout(tick, 1050 - newNow.millisecond);
        };

        tick();

        return () => clearTimeout(timeout);
    }, [getNow]);

    useEffect(() => {
        determineOffsetMs().then(setOffsetMs);

        const interval = setInterval(async () => {
            setOffsetMs(await determineOffsetMs());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    return now;
}

