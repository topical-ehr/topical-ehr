import { DefaultButton, PrimaryButton, Stack } from "@fluentui/react";
import { LexicalEditor } from "lexical";
import React from "react";
import { useDispatch } from "react-redux";
import { actions, useFHIR } from "../../redux/FhirState";
import { ChangesPanel } from "./ChangesPanel";
import css from "./EditsPanel.module.scss";
import { RichTextEditor } from "./lexical/RichTextEditor";

interface Props {}

export function EditsPanel(props: Props) {
    const editorRef = React.useRef<LexicalEditor>();
    const dispatch = useDispatch();
    const saveState = useFHIR((s) => s.fhir.saveState);

    function onSave() {
        dispatch(actions.setSaveState({ state: "save-requested" }));
    }
    function onUndoAll() {
        dispatch(actions.undoAll());
    }

    return (
        <div style={{ marginLeft: "1em" }}>
            <Stack horizontal tokens={{ childrenGap: 10 }}>
                <DefaultButton text="🗄️ Template" onClick={() => {}} />
            </Stack>

            <div style={{ marginTop: "1em", marginBottom: "1em" }}>
                <RichTextEditor
                    initialMarkdown="Summary"
                    placeholder={<p>Progress note</p>}
                    setEditor={(editor) => (editorRef.current = editor)}
                />
            </div>
            <ChangesPanel />
            <Stack horizontal tokens={{ childrenGap: 10 }}>
                <PrimaryButton disabled={saveState !== null} text="Save" onClick={onSave} />
                <DefaultButton disabled={saveState !== null} text="Undo all" onClick={onUndoAll} />
            </Stack>
        </div>
    );
}
