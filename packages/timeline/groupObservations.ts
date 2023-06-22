import * as FHIR from "@topical-ehr/fhir-types";
import { FhirResources } from "@topical-ehr/fhir-store";

import { TimelineItem } from "./TimelineItem";

export function groupObservations(resources: FhirResources) {
    const { diagnosticReports, observations } = resources;

    const items: TimelineItem[] = [];
    const groupedObservationIds = new Set<string>();

    function observationByReference(reference: FHIR.Reference): FHIR.Observation {
        const id = FHIR.parseRef(reference.reference)?.id;
        if (!id) {
            throw new Error(`unable to parse reference ${reference}`);
        }
        const ob = observations[id];
        if (!ob) {
            throw new Error(`unable to find Observation for reference ${reference}`);
        }
        return ob;
    }

    for (const report of Object.values(diagnosticReports)) {
        const title = report.code.text?.replace(/\(.*/, ""); // trim everything after a '('
        if (title && report.result?.length && report.effectiveDateTime) {
            const observations = report.result.map(observationByReference);

            items.push({
                id: "DiagnosticReport/" + report.id,
                dateTime: report.effectiveDateTime,
                item: {
                    type: "observation-group",
                    title,
                    titleFull: report.code.text ?? title,
                    observations,
                },
            });

            observations.forEach((ob) => groupedObservationIds.add(ob.id));
        } else {
            console.warn("invalid report", { report });
        }
    }

    for (const ob of Object.values(observations)) {
        for (const code of ob.code.coding ?? []) {
            if (!groupedObservationIds.has(ob.id)) {
                if (!ob.effectiveDateTime) {
                    console.warn("Observation without date", { ob });
                    continue;
                }
                items.push({
                    id: "Observation/" + ob.id,
                    dateTime: ob.effectiveDateTime,
                    item: {
                        type: "observation",
                        observation: ob,
                    },
                });
            }
        }
    }

    return items;
}
