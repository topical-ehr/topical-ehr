import shorthandData from "./ObservationShorthand.csv";

interface RawRow {
  full: string;
  short: string;
}

const shorthand = new Map<string, string>();

for (const _row of shorthandData) {
  const row = _row as RawRow;
  shorthand.set(row.full.trim(), row.short.trim());
}

export function applyShorthand(original: string) {
  return shorthand.get(original.trim()) ?? original;
}
