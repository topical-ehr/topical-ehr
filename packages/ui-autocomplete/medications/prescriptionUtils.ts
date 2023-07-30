import * as FHIR from "@topical-ehr/fhir-types";

import { SearchScope } from "@topical-ehr/terminology/FhirTerminology";

import { Config } from "../AutocompleteConfig";

export async function getDosesFor(medication: string, config: Config): Promise<Set<string>> {
    const vs = await config.searchTerminology(medication, SearchScope.medicinalProductUnitOfUse);

    const doses = new Set<string>();
    for (const term of vs.expansion?.contains ?? []) {
        const qty = parseDose(term.display);
        if (qty) {
            doses.add(qty.value + " " + qty.unit);
        }
    }

    function sort(doses: Set<string>) {
        function value(str: string) {
            return parseInt(str.split(" ")[0]);
        }
        return new Set([...doses].sort((a, b) => value(a) - value(b)));
    }

    return sort(doses);
}

export function parseDose(dose: string): FHIR.Quantity | null {
    const match = dose.match(/\d+ \w+/)?.[0];
    if (match) {
        const [value, unit] = match.split(" ");
        return {
            value: parseInt(value, 10),
            unit,
        };
    } else {
        return null;
    }
}
export function formatDose(dose: FHIR.Quantity): string {
    return `${dose.value} ${dose.unit}`;
}
export function parseDoseRange(dose: string): FHIR.Range | null {
    const match = dose.match(/\d+\s*-\d+\s*\w+/)?.[0];
    if (match) {
        const [values, unit] = match.split(" ");
        const [valueLow, valueHigh] = values.split("-").map((s) => s.trim());
        return {
            low: {
                value: parseInt(valueLow, 10),
                unit,
            },
            high: {
                value: parseInt(valueHigh, 10),
                unit,
            },
        };
    } else {
        return null;
    }
}
export function formatDoseRange(dose: FHIR.Range) {
    if (dose.high.unit === dose.low.unit) {
        return `${dose.low.value}-${dose.high.value} ${dose.low.unit}`;
    } else {
        return `${dose.low.value} ${dose.low.unit} - ${dose.high.value} ${dose.high.unit}`;
    }
}
export function isNumeric(str: string) {
    return parseInt(str, 10) + "" == str;
}
export function isNumericRange(str: string) {
    return !!str.trim().match(/^\d+\s*-\s*\d+$/);
}
export function throwError(msg: string): never {
    throw new Error(msg);
}
