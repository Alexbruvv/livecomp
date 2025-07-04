import { useEffect } from "react";

export default function useInterval(fn: () => void, intervalMs: number) {
    useEffect(() => {
        const id = setInterval(fn, intervalMs);

        return () => clearInterval(id);
    }, [fn, intervalMs]);
}

