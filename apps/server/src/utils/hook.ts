export class Hook<T> {
    private listeners: ((data: T) => void)[] = [];

    public subscribe(listener: (data: T) => void) {
        this.listeners.push(listener);

        return () => this.unsubscribe(listener);
    }

    public unsubscribe(listener: (data: T) => void) {
        this.listeners = this.listeners.filter((l) => l !== listener);
    }

    public trigger(data: T) {
        for (const listener of this.listeners) {
            listener(data);
        }
    }
}

