import * as FHIR from "@topical-ehr/fhir-types";

type CodeDefinitions = FHIR.CodeableConcept | { [key: string]: CodeDefinitions };

export const Codes = {
    Composition: {
        Type: {
            AdministeredMedications: {
                text: "Topical-EHR Administered Medications",
                coding: [
                    {
                        system: "https://topicalehr.io/fhir-codes/Composition/Type",
                        code: "administeredMedications",
                        display: "AdministeredMedications",
                    },
                ],
            },
            ProgressNote: {
                text: "Progress Note",
                coding: [
                    {
                        system: "http://loinc.org",
                        code: "1506-3",
                        display: "Progress note",
                    },
                ],
            },
            Topic: {
                text: "Topical-EHR Topic",
                coding: [
                    {
                        system: "https://topicalehr.io/fhir-codes/Composition/Type",
                        code: "topic",
                        display: "Topic",
                    },
                ],
            },
        },
        Category: {
            Active: {
                text: "Active Topical-EHR Topic",
                coding: [
                    {
                        system: "https://topicalehr.io/fhir-codes/Composition/Category",
                        code: "active",
                        display: "Active",
                    },
                ],
            },
            Inactive: {
                text: "Inactive Topical-EHR Topic",
                coding: [
                    {
                        system: "https://topicalehr.io/fhir-codes/Composition/Category",
                        code: "inactive",
                        display: "Inactive",
                    },
                ],
            },
        },
    },
};
