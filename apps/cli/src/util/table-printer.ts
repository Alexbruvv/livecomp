type TablePrinterColumns<T extends object> = Partial<
    Record<
        keyof T,
        {
            header: string;
        }
    >
>;

export class TablePrinter<T extends object> {
    private rows: T[] = [];

    constructor(private columns: TablePrinterColumns<T>) {}

    public addRow(row: T) {
        this.rows.push(row);
    }

    public print() {
        const columnWidth: Record<keyof T, number> = Object.entries(this.columns).reduce(
            (acc, [key, col]) => {
                const column = col as Exclude<TablePrinterColumns<T>[keyof T], undefined>;
                const headerLength = column.header.length;
                const maxRowLength = Math.max(...this.rows.map((row) => String(row[key as keyof T]).length));

                acc[key as keyof T] = Math.max(headerLength, maxRowLength);
                return acc;
            },
            {} as Record<keyof T, number>
        );

        const lines = [
            Object.entries(this.columns)
                .map(([key, col]) => {
                    const column = col as Exclude<TablePrinterColumns<T>[keyof T], undefined>;

                    return column.header.toUpperCase().padEnd(columnWidth[key as keyof T]);
                })
                .join("  "),
            ...this.rows.map((row) =>
                Object.keys(this.columns)
                    .map((key) => {
                        const value = String(row[key as keyof T]);

                        return value.padEnd(columnWidth[key as keyof T]);
                    })
                    .join("  ")
            ),
        ];

        console.log(lines.join("\n"));
    }
}

