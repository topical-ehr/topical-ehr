import React from "react";
import { SearchBox } from "@fluentui/react";
import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useFormatting } from "@topical-ehr/formatting/formatting";
import css from "./PatientHeader.module.scss";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";

export function PatientHeader() {
    const formatting = useFormatting();
    const dispatch = useAppDispatch();
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
                onChange={(ev, newValue) => dispatch(actions.setSearchingFor(newValue ?? ""))}
            />
        </div>
    );
}
