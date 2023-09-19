import { DateTime } from "luxon";
import * as R from "remeda";

import * as FHIR from "@topical-ehr/fhir-types";
import { FhirResources } from "@topical-ehr/fhir-store";

import { TimelineItem } from "./TimelineItem";

export function groupMedications(resources: FhirResources) {
    const { medicationAdministrations } = resources;

    const items: TimelineItem[] = R.pipe(
        Object.values(medicationAdministrations),
        R.filter((r) => !!r.effectiveDateTime),
        R.groupBy((r) => r.effectiveDateTime ?? ""),
        R.values,
        R.map((group) => ({
            id: FHIR.typeId(group[0]),

            dateTime: DateTime.fromISO(group[0].effectiveDateTime!),
            dateTimeString: group[0].effectiveDateTime!,

            item: {
                type: "medication-administration",
                meds: group,
            },
        }))
    );

    return items;
}
