import React from "react";

import * as FHIR from "@topical-ehr/fhir-types";
import { useFormatting } from "@topical-ehr/formatting/formatting";
import { useTopicContext } from "../TopicContext";
import css from "./TopicItemDisplay.module.scss";

export function PrescriptionsView() {
    const context = useTopicContext();

    if (context.editing) {
        return null;
    }

    return (
        <div>
            {context.topic.prescriptions.map((p) => (
                <PrescriptionView
                    key={p.id}
                    prescription={p}
                />
            ))}
        </div>
    );
}

interface Props {
    prescription: FHIR.MedicationRequest;
    deleted?: boolean;
}
function PrescriptionView(props: Props) {
    const formatting = useFormatting();

    const p = props.prescription;

    function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.ctrlKey) {
            alert(JSON.stringify(p, null, 2));
        }
    }

    return (
        <div
            title="Prescription"
            className={css.container}
            onClick={onContainerClick}
        >
            <div className={props.deleted ? css.deleted : ""}>
                <span className={css.title}>
                    {/* {"⚕ "} */}
                    {" 💊 "}
                    {p.medicationCodeableConcept
                        ? formatting.code(p.medicationCodeableConcept).shortText
                        : "NO CODE - control click for more info (FIXME)"}{" "}
                    {p?.dosageInstruction?.[0].doseAndRate?.[0].doseQuantity?.value ?? ""}{" "}
                    {p?.dosageInstruction?.[0].doseAndRate?.[0].doseQuantity?.unit ?? ""}{" "}
                    {formatting.code(p?.dosageInstruction?.[0].timing?.code ?? {}).shortText.toLocaleLowerCase()}
                </span>
            </div>
        </div>
    );
}
