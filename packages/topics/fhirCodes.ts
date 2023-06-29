import * as FHIR from "@topical-ehr/fhir-types";

type CodeDefinitions = FHIR.CodeableConcept | { [key: string]: CodeDefinitions };

export const Codes = {
    Composition: {
        Type: {
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
