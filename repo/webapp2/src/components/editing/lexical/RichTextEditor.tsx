import React, { useEffect } from "react";
import { $getRoot, $getSelection, EditorState, LexicalEditor } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";

import NewNodeFloatingToolbarPlugin from "./plugins/NewNodeFloatingToolbarPlugin";
import TextFormatFloatingToolbarPlugin from "./plugins/TextFormatFloatingToolbarPlugin";
import { lexicalNodes } from "./utils/nodes";

import "./editor.scss";
import "./editor-icons.css";
import "./editor-popups.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
interface Props {
    initialHTML: string | null;
    placeholder: JSX.Element;
    newNodeFloatingToolbar?: boolean;
    setEditor?: (editor: LexicalEditor) => void;

    onChangedHTML: (html: string) => void;
}

export function RichTextEditor(props: Props) {
    function getInitialState() {
        if (!props.initialHTML) {
            return undefined;
        }
        const dom = new DOMParser().parseFromString(props.initialHTML, "text/html");

        return (editor: LexicalEditor) => {
            const nodes = $generateNodesFromDOM(editor, dom);
            // console.log({ nodes, dom, html: props.initialHTML });

            const root = $getRoot();
            root.append(...nodes);
        };
    }

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
        editorState: getInitialState(),
        onError(err: Error) {
            console.error("lexical onError", err);
        },
    };
    const placeholder = <div className="editor-placeholder">{props.placeholder}</div>;

    function onChange(editorState: EditorState, editor: LexicalEditor) {
        editor.update(() => {
            const html = $generateHtmlFromNodes(editor, null);
            props.onChangedHTML(html);
        });
    }

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="editor-container">
                <RichTextPlugin
                    contentEditable={<ContentEditable className="editor-root-div" />}
                    placeholder={placeholder}
                />
                <MarkdownShortcutPlugin />
                <HistoryPlugin />
                <ListPlugin />
                <CheckListPlugin />
                {props.newNodeFloatingToolbar ?? true ? <NewNodeFloatingToolbarPlugin /> : ""}
                <TextFormatFloatingToolbarPlugin />
                <GetEditorInstancePlugin {...props} />
                <OnChangePlugin onChange={onChange} ignoreInitialChange ignoreSelectionChange />
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
