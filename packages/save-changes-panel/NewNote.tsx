import React from "react";

import { PrimaryButton, Stack } from "@fluentui/react";
import { actions, useDispatch, useFHIR } from "@topical-ehr/fhir-store";
import { GetRichTextContents, RichTextEditor } from "@topical-ehr/rich-text-editor";

import css from "./NotesPanel.module.scss";

interface Props {}

export function NewNote(props: Props) {
    // temporary hack to clear editor on save
    const saveGeneration = useFHIR((s) => s.fhir.saveGeneration);
    return <NewNoteInner key={saveGeneration} />;
}
function NewNoteInner(props: Props) {
    const dispatch = useDispatch();

    const getRichTextContents = React.useRef<GetRichTextContents>();

    function onNotesChanged(getContents: GetRichTextContents) {
        getRichTextContents.current = getContents;
    }

    function onSave() {
        if (!getRichTextContents.current) {
            console.warn("getRichTextContents is null");
            return;
        }
        const progressNote = getRichTextContents.current();
        if (!progressNote.markdown) {
            alert("Please enter a note");
            return;
        }

        dispatch(actions.save({ progressNote }));
    }
    function onUndoAll() {
        dispatch(actions.undoAll());
    }

    return (
        <div className={css.notesPanel}>
            <div className={css.editor}>
                <RichTextEditor
                    initialHTML=""
                    placeholder={<p>New progress note</p>}
                    onChange={onNotesChanged}
                />
            </div>
            <Stack
                className={css.buttons}
                horizontal
                tokens={{ childrenGap: 10 }}
            >
                <PrimaryButton
                    // disabled={saveState !== null}
                    text="Save"
                    onClick={onSave}
                />
            </Stack>
        </div>
    );
}
