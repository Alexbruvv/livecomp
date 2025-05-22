function* chunk<T>(array: T[], size: number): Generator<T[]> {
    for (let i = 0; i < array.length; i += size) {
        yield array.slice(i, i + size);
    }
}

export const array = { chunk };

