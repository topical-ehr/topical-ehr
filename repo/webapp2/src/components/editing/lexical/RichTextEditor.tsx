import React, { useEffect } from "react";
import { LexicalEditor } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";

import NewNodeFloatingToolbarPlugin from "./plugins/NewNodeFloatingToolbarPlugin";
import TextFormatFloatingToolbarPlugin from "./plugins/TextFormatFloatingToolbarPlugin";
import { lexicalNodes } from "./utils/nodes";

import "./editor.scss";
import "./editor-icons.css";
import "./editor-popups.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
interface Props {
    initialMarkdown: string;
    placeholder: JSX.Element;
    newNodeFloatingToolbar?: boolean;
    setEditor: (editor: LexicalEditor) => void;
}

export function RichTextEditor(props: Props) {
    const initialConfig = {
        namespace: "TopicalEHR",
        theme: {
            heading: {
                h1: "editor-h1",
                h2: "editor-h2",
                h3: "editor-h3",
                h4: "editor-h4",
                h5: "editor-h5",
                h6: "editor-h6",
            },
        },
        nodes: lexicalNodes,
        onError(err: Error) {
            console.error("lexical onError", err);
        },
    };
    const placeholder = <div className="editor-placeholder">{props.placeholder}</div>;

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="editor-container">
                <RichTextPlugin
                    contentEditable={<ContentEditable className="editor-root-div" />}
                    placeholder={placeholder}
                    initialEditorState={undefined}
                />
                <MarkdownShortcutPlugin />
                <HistoryPlugin />
                <ListPlugin />
                <CheckListPlugin />
                {props.newNodeFloatingToolbar ?? true ? <NewNodeFloatingToolbarPlugin /> : ""}
                <TextFormatFloatingToolbarPlugin />
                <GetEditorInstancePlugin {...props} />
            </div>
        </LexicalComposer>
    );
}

function GetEditorInstancePlugin(props: Props): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        if (props.setEditor) {
            props.setEditor(editor);
        }
    }, [editor]);
    return null;
}
