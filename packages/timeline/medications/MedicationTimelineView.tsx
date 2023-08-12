import React from "react";
import css from "./MedicationTimelineView.module.scss";

import * as FHIR from "@topical-ehr/fhir-types";
import { FhirSVG } from "@topical-ehr/ui-elements/FhirSVG";
import { formatDose } from "@topical-ehr/ui-autocomplete/medications/prescriptionUtils";

interface Props {
    meds: FHIR.MedicationAdministration[];
}

export function MedicationTimelineView(props: Props) {
    const { meds } = props;
    return (
        <div className={css.container}>
            <h4>Meds given:</h4>
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
