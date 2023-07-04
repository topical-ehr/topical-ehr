/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
    $getRoot,
    $getSelection,
    $isParagraphNode,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    ElementNode,
    LexicalCommand,
    LexicalEditor,
    SELECTION_CHANGE_COMMAND,
} from "lexical";
import { HeadingTagType, $createHeadingNode } from "@lexical/rich-text";
import { $wrapLeafNodesInElements } from "@lexical/selection";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { INSERT_CHECK_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";

import { getSelectedNode } from "../utils/selection";

function setPopupPosition(editor: HTMLElement, rect: DOMRect): void {
    let top = rect.top - 8 + window.pageYOffset;
    let left = rect.left + 280 + window.pageXOffset - editor.offsetWidth;
    editor.style.opacity = "1";
    editor.style.top = `${top}px`;
    editor.style.left = `${left}px`;
}

function NewNodeFloatingToolbar({ editor }: { editor: LexicalEditor }): JSX.Element {
    const popupRef = useRef<HTMLDivElement | null>(null);

    const updateNewNodeFloatingToolbar = useCallback(() => {
        const selection = $getSelection();

        const popupElem = popupRef.current;
        const nativeSelection = window.getSelection();

        if (popupElem === null) {
            return;
        }

        console.log("updateNewNodeFloatingToolbar", { selection, nativeSelection });
        const rootElement = editor.getRootElement();
        if (
            selection !== null &&
            nativeSelection !== null &&
            rootElement !== null &&
            rootElement.contains(nativeSelection.anchorNode)
        ) {
            const { anchorNode } = nativeSelection;
            if (anchorNode && anchorNode.nodeType === Node.ELEMENT_NODE) {
                const rect = (anchorNode as Element).getBoundingClientRect();
                console.log("setPopupPosition", { rect });
                setPopupPosition(popupElem, rect);
            }
        }
    }, [editor]);

    useEffect(() => {
        const onResize = () => {
            editor.getEditorState().read(() => {
                updateNewNodeFloatingToolbar();
            });
        };
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, [editor, updateNewNodeFloatingToolbar]);

    useEffect(() => {
        editor.getEditorState().read(() => {
            updateNewNodeFloatingToolbar();
        });
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateNewNodeFloatingToolbar();
                });
            }),

            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateNewNodeFloatingToolbar();
                    return false;
                },
                COMMAND_PRIORITY_LOW
            )
        );
    }, [editor, updateNewNodeFloatingToolbar]);

    return (
        <div
            ref={popupRef}
            className="floating-text-format-popup"
        >
            <HeadingButton
                editor={editor}
                headingSize="h1"
            />
            <HeadingButton
                editor={editor}
                headingSize="h2"
            />
            <HeadingButton
                editor={editor}
                headingSize="h3"
            />
            <CommandButton
                editor={editor}
                icon="bullet-list"
                label="New Bullet List"
                command={INSERT_UNORDERED_LIST_COMMAND}
            />
            <CommandButton
                editor={editor}
                icon="check-list"
                label="New Check List"
                command={INSERT_CHECK_LIST_COMMAND}
            />
        </div>
    );
}

function HeadingButton(props: { editor: LexicalEditor; headingSize: HeadingTagType }) {
    return (
        <CreateNodeButton
            editor={props.editor}
            label={`New Heading level ${props.headingSize.substring(1)}`}
            icon={props.headingSize}
            newNode={() => $createHeadingNode(props.headingSize)}
        />
    );
}

function CreateNodeButton(props: { editor: LexicalEditor; label: string; icon: string; newNode: () => ElementNode }) {
    return (
        <button
            onClick={() => {
                props.editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        $wrapLeafNodesInElements(selection, props.newNode);
                    }
                });
            }}
            className="popup-item spaced"
            title={props.label}
            aria-label={props.label}
        >
            <i className={`icon ${props.icon}`} />
        </button>
    );
}

function CommandButton(props: {
    editor: LexicalEditor;
    label: string;
    icon: string;
    command: LexicalCommand<string | null>;
}) {
    return (
        <button
            onClick={() => {
                props.editor.dispatchCommand(props.command, undefined);
            }}
            className="popup-item spaced"
            title={props.label}
            aria-label={props.label}
        >
            <i className={`icon ${props.icon}`} />
        </button>
    );
}

function useNewNodeFloatingToolbar(editor: LexicalEditor): JSX.Element | null {
    const [show, setShow] = useState(false);

    const updatePopup = useCallback(() => {
        editor.getEditorState().read(() => {
            // Should not to pop up the floating toolbar when using IME input
            if (editor.isComposing()) {
                return;
            }
            const selection = $getSelection();
            const nativeSelection = window.getSelection();
            const rootElement = editor.getRootElement();

            if (
                nativeSelection !== null &&
                (!$isRangeSelection(selection) || rootElement === null || !rootElement.contains(nativeSelection.anchorNode))
            ) {
                setShow(false);
                return;
            }

            if (!$isRangeSelection(selection)) {
                return;
            }

            const node = getSelectedNode(selection);

            const startOfLine =
                selection.anchor.key == selection.focus.key &&
                selection.anchor.offset === 0 &&
                selection.focus.offset === 0;

            const emptyParagraph = $isParagraphNode(node) && node.getTextContentSize() === 0;

            const firstParagraph = selection.anchor.getNode() === $getRoot().getFirstChild();

            setShow(startOfLine && emptyParagraph && !firstParagraph);
        });
    }, [editor]);

    useEffect(() => {
        document.addEventListener("selectionchange", updatePopup);
        return () => {
            document.removeEventListener("selectionchange", updatePopup);
        };
    }, [updatePopup]);

    useEffect(() => {
        return editor.registerUpdateListener(() => {
            updatePopup();
        });
    }, [editor, updatePopup]);

    if (!show) {
        return null;
    }

    return createPortal(<NewNodeFloatingToolbar editor={editor} />, document.body);
}

export default function NewNodeFloatingToolbarPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    return useNewNodeFloatingToolbar(editor);
}
