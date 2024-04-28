import React from "react";
import { Button } from "@fluentui/react-components";
import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";

import * as FHIR from "@topical-ehr/fhir-types";
import { Codes } from "@topical-ehr/fhir-types/FhirCodes";
import { isEncounterActive } from "../Topic";

import calendarIcon from "/icons/calendar-icons8.svg";

interface Props {}

export function NewEncounterButton(props: Props) {
    const dispatch = useAppDispatch();
    const patientId = useFHIR((s) => s.fhir.patientId);
    const encounters = useFHIR((s) => s.fhir.resourcesWithEdits.encounters);

    const anyActive = Object.values(encounters).some(isEncounterActive);
    if (anyActive) {
        return null;
    }

    function onNewEncounter() {
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
        <Button
            icon={<img src={calendarIcon} />}
            onClick={onNewEncounter}
        >
            New encounter
        </Button>
    );
}
