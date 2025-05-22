export function formatClock(seconds: number): string {
    seconds = Math.round(seconds);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    return `${(minutes + hours * 60).toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

