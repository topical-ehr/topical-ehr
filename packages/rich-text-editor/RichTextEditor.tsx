import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $createParagraphNode, $getRoot, $isTextNode, EditorState, LexicalEditor } from "lexical";
import React from "react";

import NewNodeFloatingToolbarPlugin from "./plugins/NewNodeFloatingToolbarPlugin";
import TextFormatFloatingToolbarPlugin from "./plugins/TextFormatFloatingToolbarPlugin";
import { lexicalNodes } from "./utils/nodes";

import "./editor-icons.css";
import "./editor-popups.css";
import "./editor.scss";

interface Props {
    initialHTML: string | null;
    placeholder: JSX.Element;
    newNodeFloatingToolbar?: boolean;
    setEditor?: (editor: LexicalEditor) => void;

    onChangedHTML?: (html: string) => void;
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

            // Lexical doesn't allow text nodes directly added to the root node
            const withoutTextNodes = nodes.map((n) => {
                if ($isTextNode(n)) {
                    const p = $createParagraphNode();
                    p.append(n);
                    return p;
                }
                return n;
            });

            const root = $getRoot();
            try {
                root.append(...withoutTextNodes);
            } catch (err) {
                debugger;
                throw err;
            }
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
            props.onChangedHTML?.(html);
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
                <OnChangePlugin
                    onChange={onChange}
                    ignoreInitialChange
                    ignoreSelectionChange
                />
            </div>
        </LexicalComposer>
    );
}

function GetEditorInstancePlugin(props: Props): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    React.useEffect(() => {
        if (props.setEditor) {
            props.setEditor(editor);
        }
    }, [editor]);
    return null;
}
