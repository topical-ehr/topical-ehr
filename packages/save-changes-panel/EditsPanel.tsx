import React from "react";

import * as FHIR from "@topical-ehr/fhir-types";
import { DefaultButton, PrimaryButton, Stack } from "@fluentui/react";
import { actions, useFHIR, useDispatch } from "@topical-ehr/fhir-store";
import { RichTextEditor } from "@topical-ehr/rich-text-editor";

import { ChangesPanel } from "./ChangesPanel";
import { Codes } from "@topical-ehr/fhir-types/FhirCodes";

interface Props {}

export function EditsPanel(props: Props) {
    const dispatch = useDispatch();
    const patientId = useFHIR((s) => s.fhir.patientId);
    const saveState = useFHIR((s) => s.fhir.saveState);

    const [noteHTML, setNote] = React.useState<string>("");

    function onSave() {
        if (!noteHTML) {
            alert("Please enter a note");
        }

        // create composition for the progress note
        const now = new Date().toISOString();
        const newComposition = FHIR.Composition.new({
            subject: { reference: `Patient/${patientId}` },
            status: "final",
            type: Codes.Composition.Type.ProgressNote,
            date: now,
            title: "New topic",
            section: [
                {
                    title: "Progress note",
                    text: {
                        div: `<div>${noteHTML}</div>`,
                        status: "additional",
                    },
                },
            ],
        });
        dispatch(actions.edit(newComposition));

        // save to FHIR server
        dispatch(actions.setSaveState({ state: "save-requested" }));

        setNote("");
    }
    function onUndoAll() {
        dispatch(actions.undoAll());
    }

    return (
        <div style={{ marginLeft: "1em" }}>
            <Stack
                horizontal
                tokens={{ childrenGap: 10 }}
            >
                <DefaultButton
                    text="🗄️ Template"
                    onClick={() => {}}
                />
            </Stack>

            <div style={{ marginTop: "1em", marginBottom: "1em" }}>
                <RichTextEditor
                    initialHTML=""
                    placeholder={<p>Progress note</p>}
                    onChangedHTML={setNote}
                />
            </div>
            <ChangesPanel />
            <Stack
                horizontal
                tokens={{ childrenGap: 10 }}
            >
                <PrimaryButton
                    // disabled={saveState !== null}
                    text="Save"
                    onClick={onSave}
                />
                {/* <DefaultButton disabled={saveState !== null} text="Undo all" onClick={onUndoAll} /> */}
            </Stack>
        </div>
    );
}
