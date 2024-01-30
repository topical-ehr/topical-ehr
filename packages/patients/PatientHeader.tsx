import React from "react";
import { SearchBox } from "@fluentui/react";
import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useFormatting } from "@topical-ehr/formatting/formatting";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import * as FHIR from "@topical-ehr/fhir-types";

import { EditPatientDialog } from "./EditPatientDialog";

import css from "./PatientHeader.module.scss";

export function PatientHeader() {
    const formatting = useFormatting();
    const dispatch = useAppDispatch();
    const patient = useFHIR((s) => s.fhir.resourcesWithEdits.patients[s.fhir.patientId]);

    const showSearch = false;

    const pf = formatting.patient(patient);
    const { age, gender, born } = pf.ageGenderBorn;
    const lines = [
        `${age}  ·  ${gender} · ${born}`,
        // `${age}  ·  ${gender}`,
        // born,
    ];

    const [showEditDialog, setShowEditDialog] = React.useState(true);

    function onClick() {
        setShowEditDialog(!showEditDialog);
    }
    function onEditDone(newPatient: FHIR.Patient | null) {
        if (newPatient) {
            dispatch(actions.edit(newPatient));
            dispatch(actions.save({ filter: (r) => r.resourceType === "Patient" }));
        }
        setShowEditDialog(false);
    }

    return (
        <div className={css.patientHeader}>
            <div className={css.name}>{pf.name}</div>
            <div
                className={css.details}
                title="Click to edit patient details"
                onClick={onClick}
            >
                {lines.map((line) => (
                    <div
                        className={css.summary}
                        key={line}
                    >
                        {line}
                    </div>
                ))}
            </div>

            {showEditDialog && (
                <EditPatientDialog
                    patient={patient}
                    onClose={onEditDone}
                />
            )}

            {showSearch && (
                <SearchBox
                    placeholder="Search"
                    showIcon
                    onChange={(ev, newValue) =>
                        dispatch(actions.setSearchingFor(newValue ?? ""))
                    }
                />
            )}
        </div>
    );
}
