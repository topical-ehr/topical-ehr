import * as FHIR from "./FhirTypes";

export function hasCode(cc: FHIR.CodeableConcept, coding: FHIR.Coding) {
    const { system, code } = coding;

    if (!cc.coding) {
        return false;
    }

    return cc.coding.some((c) => c.system === system && c.code === code);
}

export function fhirTypeId(r: FHIR.Resource) {
    return r.resourceType + "/" + r.id;
}
