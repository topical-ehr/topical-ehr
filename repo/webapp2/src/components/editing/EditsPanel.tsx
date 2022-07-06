import { DefaultButton, PrimaryButton, Stack } from "@fluentui/react";
import { LexicalEditor } from "lexical";
import React from "react";
import { ChangesPanel } from "./ChangesPanel";
import css from "./EditsPanel.module.scss";
import { RichTextEditor } from "./lexical/RichTextEditor";

interface Props {}

export function EditsPanel(props: Props) {
    const editorRef = React.useRef<LexicalEditor>();
    function onSave() {}
    return (
        <div style={{ marginLeft: "1em" }}>
            <Stack horizontal tokens={{ childrenGap: 10 }}>
                <DefaultButton text="🗄️ Template" onClick={() => {}} />
            </Stack>

            <div style={{ marginTop: "1em", marginBottom: "1em" }}>
                <RichTextEditor
                    initialMarkdown="Summary"
                    placeholder={<p>Progress note (optional)</p>}
                    setEditor={(editor) => (editorRef.current = editor)}
                />
            </div>
            <ChangesPanel />
            <Stack horizontal tokens={{ childrenGap: 10 }}>
                <PrimaryButton text="Save" onClick={onSave} />
                <DefaultButton text="Undo all" onClick={onSave} />
            </Stack>
        </div>
    );
}
