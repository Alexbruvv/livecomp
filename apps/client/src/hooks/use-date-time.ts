import { CompetitionClock } from "@livecomp/utils";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";

async function determineOffsetMs() {
    const now = performance.now();
    const isoServerDate = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/now`).then((response) => response.text());
    const delta = performance.now() - now;

    return DateTime.now().diff(DateTime.fromISO(isoServerDate)).as("milliseconds") + delta / 2;
}

export default function useDateTime(competitionClock?: CompetitionClock) {
    const [offsetMs, setOffsetMs] = useState(0);

    const getNow = useMemo(
        () =>
            competitionClock
                ? () => competitionClock.now().plus({ milliseconds: offsetMs })
                : () => DateTime.now().plus({ milliseconds: offsetMs }),
        [competitionClock, offsetMs]
    );

    const [now, setNow] = useState(getNow());

    useEffect(() => {
        const interval = setInterval(() => setNow(getNow()), 50);

        return () => clearInterval(interval);
    }, [getNow]);

    useEffect(() => {
        determineOffsetMs().then(setOffsetMs);

        const interval = setInterval(async () => {
            setOffsetMs(await determineOffsetMs());
        }, 20000);

        return () => clearInterval(interval);
    }, []);

    return now;
}

