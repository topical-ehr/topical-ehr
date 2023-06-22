import rawData from "./ObservationRanges.csv";

interface RawRow {
    name: string;
    low: string;
    high: string;
    units: string;
}
interface Range {
    low: number;
    high: number;
}
const data = new Map<string, Range>();
for (const _row of rawData) {
    const row = _row as RawRow;

    const names = row.name.split("|");
    for (const name of names) {
        data.set(name + "|" + row.units, { low: +row.low, high: +row.high });
    }
}

// console.log({ ObservationRanges: rawData });

export interface Interpretation {
    interpretation: "normal" | "low" | "high" | "unknown";
    reference?: {
        low: number;
        high: number;
    };
}
export function interpret(value: number, reference: Range) {
    if (value <= reference.low) {
        return "low";
    }
    if (value >= reference.high) {
        return "high";
    }
    return "normal";
}

export function lookupReferenceInterval(code: string, units?: string): Range | undefined {
    return data.get(code + "|" + units);
}
