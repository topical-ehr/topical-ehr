import * as FHIR from "../../utils/FhirTypes";
import rawData from "./timing-codes.csv";

interface RawRow {
    SNOMED_display: string;
    SNOMED_code: string;
    frequency: string;
    period: string;
    periodUnit: string;
    whenSystem: string;
    whenCode: string;
}

export const timingCodesFromSNOMED = new Map<string, FHIR.Timing>();

for (const _row of rawData) {
    const row = _row as RawRow;
    timingCodesFromSNOMED.set(row.SNOMED_code, {
        code: {
            coding: [
                {
                    system: "http://snomed.info/sct",
                    code: row.SNOMED_code,
                    display: row.SNOMED_display,
                },
            ],
            text: row.SNOMED_display,
        },
        repeat: {
            frequency: parseInt(row.frequency, 10),
            period: parseInt(row.period, 10),
            periodUnit: row.periodUnit,
            when: row.whenCode ? [row.whenCode] : undefined,
        },
    });
}
