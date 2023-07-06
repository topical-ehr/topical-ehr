import React from "react";
import { DefaultButton } from "@fluentui/react";
import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";

import * as FHIR from "@topical-ehr/fhir-types";
import { Codes } from "@topical-ehr/fhir-types/FhirCodes";

interface Props {}

export function NewTopicButton(props: Props) {
    const dispatch = useAppDispatch();
    const patientId = useFHIR((s) => s.fhir.patientId);

    function onNewTopic() {
        const now = new Date().toISOString();
        const newComposition = FHIR.Composition.new({
            subject: { reference: `Patient/${patientId}` },
            status: "preliminary",
            type: Codes.Composition.Type.Topic,
            date: now,
            title: "New topic",
            section: [{}],
        });
        dispatch(actions.edit(newComposition));
    }
    return (
        <div>
            <DefaultButton
                text="➕ New topic"
                onClick={onNewTopic}
            />
        </div>
    );
}
