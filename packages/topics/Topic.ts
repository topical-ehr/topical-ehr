import * as FHIR from "@topical-ehr/fhir-types";
import { FhirResourceById } from "@topical-ehr/fhir-types";
import { Codes } from "@topical-ehr/fhir-types/FhirCodes";
import { hasCode } from "@topical-ehr/fhir-types/FhirUtils";

export interface Topic {
    id: string;
    composition: FHIR.Composition;
    conditions: FHIR.Condition[];
    prescriptions: FHIR.MedicationRequest[];
    tasks: FHIR.Task[];
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
function tasksFromComposition(c: FHIR.Composition, tasks: FhirResourceById<FHIR.Task>) {
    const _resources = (c.section ?? [])
        .flatMap((section) => section.entry)
        .map((ref) => tasks[FHIR.parseRef(ref?.reference, "Task")?.id ?? ""])
        .filter((c) => c);
    debugger;
    return _resources;
}

export function loadTopics(
    conditions: FhirResourceById<FHIR.Condition>,
    compositions: FhirResourceById<FHIR.Composition>,
    prescriptions: FhirResourceById<FHIR.MedicationRequest>,
    tasks: FhirResourceById<FHIR.Task>
): Topic[] {
    return Object.values(compositions)
        .filter((composition) => hasCode(composition.type, Codes.Composition.Type.Topic.coding[0]))
        .map((composition) => ({
            id: composition.id,
            composition: composition,
            conditions: conditionsFromComposition(composition, conditions),
            prescriptions: prescriptionsFromComposition(composition, prescriptions),
            tasks: tasksFromComposition(composition, tasks),
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
