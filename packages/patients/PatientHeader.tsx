import React from "react";
import { SearchBox } from "@fluentui/react";
import { useFHIR } from "@topical-ehr/fhir-store";
import { useFormatting } from "@topical-ehr/formatting/formatting";
import css from "./PatientHeader.module.scss";

export function PatientHeader() {
    const formatting = useFormatting();
    const patient = useFHIR((s) => s.fhir.resourcesWithEdits.patients[s.fhir.patientId]);

    const pf = formatting.patient(patient);
    const { age, gender, born } = pf.ageGenderBorn;
    const lines = [
        `${age}  ·  ${gender} · ${born}`,
        // `${age}  ·  ${gender}`,
        // born,
    ];
    return (
        <div className={css.container}>
            <div className={css.name}>{pf.name}</div>
            <div className={css.details}>
                {lines.map((line) => (
                    <div
                        className={css.summary}
                        key={line}
                    >
                        {line}
                    </div>
                ))}
            </div>
            <SearchBox
                placeholder="Search"
                showIcon
                onSearch={(newValue) => console.log("value is " + newValue)}
            />
        </div>
    );
}
