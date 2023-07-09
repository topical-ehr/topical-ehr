import * as FHIR from "@topical-ehr/fhir-types";

// @ts-ignore
import rawData from "./timing-codes.csv";

interface RawRow {
    display: string;
    SNOMED_display: string;
    SNOMED_code: string;
    synonyms: string;
    frequency: string;
    period: string;
    periodUnit: string;
    eventTiming: string;
}

interface TimingEntry {
    texts: string[];
    timing: FHIR.Timing;
}

export const timingCodesAllowed: TimingEntry[] = [];

for (const _row of rawData) {
    const row = _row as RawRow;
    timingCodesAllowed.push({
        texts: [row.display, ...row.synonyms.split("|")].map((s) => s.trim()),
        timing: {
            code: {
                coding: [
                    {
                        system: "http://snomed.info/sct",
                        code: row.SNOMED_code,
                        display: row.SNOMED_display,
                    },
                ],
                text: row.display,
            },
            repeat: {
                frequency: parseInt(row.frequency, 10),
                period: parseInt(row.period, 10),
                periodUnit: row.periodUnit,
                when: row.eventTiming ? [row.eventTiming] : undefined,
            },
        },
    });
}
