import React from "react";

import * as FHIR from "@topical-ehr/fhir-types";
import { formatDose } from "@topical-ehr/ui-autocomplete/medications/prescriptionUtils";

import css from "./MedicationTimelineView.module.scss";

interface Props {
    meds: FHIR.MedicationAdministration[];
    time: string;
}

export function MedicationTimelineView(props: Props) {
    const { meds } = props;
    return (
        <div className={css.container}>
            <div>
                {props.time}
                <h4>Meds given</h4>
            </div>
            <ul>
                {meds.map((med) => (
                    <li key={FHIR.typeId(med)}>
                        {med.medicationCodeableConcept?.text} {med.dosage?.dose ? formatDose(med?.dosage?.dose) : null}
                    </li>
                ))}
            </ul>
        </div>
    );
}
