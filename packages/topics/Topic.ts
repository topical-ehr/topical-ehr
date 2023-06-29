import * as FHIR from "@topical-ehr/fhir-types";
import { FhirResourceById } from "@topical-ehr/fhir-types";
import { Codes } from "./fhirCodes";

export interface Topic {
    id: string;
    composition: FHIR.Composition;
    conditions: FHIR.Condition[];
    prescriptions: FHIR.MedicationRequest[];
}

function conditionsFromComposition(c: FHIR.Composition, conditions: FhirResourceById<FHIR.Condition>) {
    const _conditions = (c.section ?? [])
        .flatMap((section) => section.entry)
        .map((ref) => conditions[FHIR.parseRef(ref?.reference, "Condition")?.id ?? ""])
        .filter((c) => c);
    return _conditions;
}
function prescriptionsFromComposition(c: FHIR.Composition, prescriptions: FhirResourceById<FHIR.MedicationRequest>) {
    const _resources = (c.section ?? [])
        .flatMap((section) => section.entry)
        .map((ref) => prescriptions[FHIR.parseRef(ref?.reference, "MedicationRequest")?.id ?? ""])
        .filter((c) => c);
    return _resources;
}

export function loadTopics(
    conditions: FhirResourceById<FHIR.Condition>,
    compositions: FhirResourceById<FHIR.Composition>,
    prescriptions: FhirResourceById<FHIR.MedicationRequest>
): Topic[] {
    return Object.values(compositions).map((c) => ({
        id: c.id,
        composition: c,
        conditions: conditionsFromComposition(c, conditions),
        prescriptions: prescriptionsFromComposition(c, prescriptions),
    }));
}

export function activeStatus(topic: Topic) {
    const categories = topic.composition.category ?? [];
    const ourCategories = categories.filter(
        (c) => c.coding?.[0]?.system === Codes.Composition.Category.Active.coding[0].system
    );
    const ourCodes = ourCategories.map((c) => c.coding?.[0]?.code);

    if (ourCodes.includes("active")) {
        return "active";
    }
    if (ourCodes.includes("inactive")) {
        return "inactive";
    }

    console.warn("activeStatus: unknown status", topic);
    return "unknown";
}
