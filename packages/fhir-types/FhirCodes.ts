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
                text: "Active Topic",
                coding: [
                    {
                        system: "https://topicalehr.io/fhir-codes/Composition/Category",
                        code: "active",
                        display: "Active",
                    },
                ],
            },
            Inactive: {
                text: "Inactive Topic",
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
    Extension: {
        RenderingMarkdown: "http://hl7.org/fhir/StructureDefinition/rendering-markdown",
        ResolveAsVersionSpecific: "http://hl7.org/fhir/StructureDefinition/resolve-as-version-specific",
        VersionModified: "https://topicalehr.io/fhir-codes/Extension/VersionModified",
    },
    Observation: {
        BloodPressure: {
            Panel: {
                coding: [
                    {
                        system: "http://loinc.org",
                        code: "85354-9",
                        display: "Blood pressure panel with all children optional",
                    },
                ],
                text: "Blood pressure systolic & diastolic",
            },
            Systolic: {
                coding: [
                    {
                        system: "http://loinc.org",
                        code: "8480-6",
                        display: "Systolic blood pressure",
                    },
                ],
            },
            Diastolic: {
                coding: [
                    {
                        system: "http://loinc.org",
                        code: "8462-4",
                        display: "Diastolic blood pressure",
                    },
                ],
            },
            Unit: {
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mm[Hg]",
            },
        },
        HeartRate: {
            Code: {
                coding: [
                    {
                        system: "http://loinc.org",
                        code: "8867-4",
                        display: "Heart rate",
                    },
                ],
                text: "Heart rate",
            },
            Unit: {
                unit: "beats/minute",
                system: "http://unitsofmeasure.org",
                code: "/min",
            },
        },
        RespiratoryRate: {
            Code: {
                coding: [
                    {
                        system: "http://loinc.org",
                        code: "9279-1",
                        display: "Respiratory rate",
                    },
                ],
                text: "Respiratory rate",
            },
            Unit: {
                unit: "breaths/minute",
                system: "http://unitsofmeasure.org",
                code: "/min",
            },
        },
        SPO2: {
            Code: {
                coding: [
                    {
                        system: "http://loinc.org",
                        code: "2708-6",
                        display: "Oxygen saturation in Arterial blood",
                    },
                    {
                        system: "http://loinc.org",
                        code: "59408-5",
                        display: "Oxygen saturation in Arterial blood by Pulse oximetry",
                    },
                ],
            },
            Unit: {
                unit: "%",
                system: "http://unitsofmeasure.org",
                code: "%",
            },
        },

        Pain: {
            Code: {
                coding: [
                    {
                        system: "http://loinc.org",
                        code: "38208-5",
                        display: "Pain severity - Reported",
                    },
                ],
            },
            Unit: {
                unit: "/10",
            },
        },
    },
};
