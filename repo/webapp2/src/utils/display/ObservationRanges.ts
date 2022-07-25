import rawData from "./ObservationRanges.csv";
import { Observation } from "../FhirTypes";
import { ObservationFormatter } from "./ObservationFormatter";

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

interface Interpretation {
  interpretation: "normal" | "low" | "high" | "unknown";
  reference?: {
    low: number;
    high: number;
  };
}
function interpret(value: number, reference: Range) {
  if (value <= reference.low) {
    return "low";
  }
  if (value >= reference.high) {
    return "high";
  }
  return "normal";
}

export function interpretObservation(of: ObservationFormatter): Interpretation {
  const key = of.code + "|" + of.units;
  const reference = data.get(key);

  const value = parseFloat(of.value ?? "");

  if (Number.isFinite(value) && reference) {
    return {
      interpretation: interpret(value, reference),
      reference,
    };
  } else {
    return {
      interpretation: "unknown",
    };
  }
}
