import { FhirResources } from "@topical-ehr/fhir-store";
import { Codes } from "@topical-ehr/fhir-types/FhirCodes";
import { hasCode } from "@topical-ehr/fhir-types/FhirUtils";

import { TimelineItem } from "./TimelineItem";

export function groupNotes(resources: FhirResources) {
    const { compositions } = resources;

    const items: TimelineItem[] = Object.values(compositions)
        .filter((composition) => hasCode(composition.type, Codes.Composition.Type.ProgressNote.coding[0]))
        .map((composition) => ({
            id: "Composition/" + composition.id,
            dateTime: composition.date,
            item: {
                type: "progress-note",
                document: composition,
            },
        }));

    return items;
}
