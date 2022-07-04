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
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    COMMAND_PRIORITY_LOW,
    FORMAT_TEXT_COMMAND,
    LexicalEditor,
    SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { getSelectedNode } from "../utils/selection";

function setPopupPosition(editor: HTMLElement, rect: DOMRect, rootElementRect: DOMRect): void {
    let top = rect.top - 8 + window.pageYOffset;
    let left = rect.left + 140 + window.pageXOffset - editor.offsetWidth + rect.width;
    if (left + editor.offsetWidth > rootElementRect.right) {
        left = rect.right - editor.offsetWidth;
        top = rect.top - 50 + window.pageYOffset;
    }
    if (left < 0) {
        left = rect.left;
        top = rect.bottom + 20;
    }
    if (rect.width >= rootElementRect.width - 25) {
        left = rect.left;
        top = rect.top - 50 + window.pageYOffset;
    }
    if (top < rootElementRect.top) {
        top = rect.bottom + 20;
    }
    editor.style.opacity = "1";
    editor.style.top = `${top}px`;
    editor.style.left = `${left}px`;
}

function TextFormatFloatingToolbar({
    editor,
    isBold,
    isItalic,
    isUnderline,
}: {
    editor: LexicalEditor;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
}): JSX.Element {
    const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

    const updateTextFormatFloatingToolbar = useCallback(() => {
        const selection = $getSelection();

        const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
        const nativeSelection = window.getSelection();

        if (popupCharStylesEditorElem === null) {
            return;
        }

        const rootElement = editor.getRootElement();
        if (
            selection !== null &&
            nativeSelection !== null &&
            !nativeSelection.isCollapsed &&
            rootElement !== null &&
            rootElement.contains(nativeSelection.anchorNode)
        ) {
            const domRange = nativeSelection.getRangeAt(0);
            const rootElementRect = rootElement.getBoundingClientRect();
            let rect;

            if (nativeSelection.anchorNode === rootElement) {
                let inner = rootElement;
                while (inner.firstElementChild != null) {
                    inner = inner.firstElementChild as HTMLElement;
                }
                rect = inner.getBoundingClientRect();
            } else {
                rect = domRange.getBoundingClientRect();
            }

            setPopupPosition(popupCharStylesEditorElem, rect, rootElementRect);
        }
    }, [editor]);

    useEffect(() => {
        const onResize = () => {
            editor.getEditorState().read(() => {
                updateTextFormatFloatingToolbar();
            });
        };
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, [editor, updateTextFormatFloatingToolbar]);

    useEffect(() => {
        editor.getEditorState().read(() => {
            updateTextFormatFloatingToolbar();
        });
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateTextFormatFloatingToolbar();
                });
            }),

            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateTextFormatFloatingToolbar();
                    return false;
                },
                COMMAND_PRIORITY_LOW
            )
        );
    }, [editor, updateTextFormatFloatingToolbar]);

    return (
        <div ref={popupCharStylesEditorRef} className="floating-text-format-popup">
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                }}
                className={"popup-item spaced " + (isBold ? "active" : "")}
                aria-label="Format text as bold"
            >
                <i className="format bold" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
                }}
                className={"popup-item spaced " + (isItalic ? "active" : "")}
                aria-label="Format text as italics"
            >
                <i className="format italic" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
                }}
                className={"popup-item spaced " + (isUnderline ? "active" : "")}
                aria-label="Format text to underlined"
            >
                <i className="format underline" />
            </button>
        </div>
    );
}

function useTextFormatFloatingToolbar(editor: LexicalEditor): JSX.Element | null {
    const [isText, setIsText] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);

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
                (!$isRangeSelection(selection) ||
                    rootElement === null ||
                    !rootElement.contains(nativeSelection.anchorNode))
            ) {
                setIsText(false);
                return;
            }

            if (!$isRangeSelection(selection)) {
                return;
            }

            const node = getSelectedNode(selection);

            // Update text format
            setIsBold(selection.hasFormat("bold"));
            setIsItalic(selection.hasFormat("italic"));
            setIsUnderline(selection.hasFormat("underline"));

            if (selection.getTextContent() !== "") {
                setIsText($isTextNode(node));
            } else {
                setIsText(false);
            }
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

    if (!isText) {
        return null;
    }

    return createPortal(
        <TextFormatFloatingToolbar
            editor={editor}
            isBold={isBold}
            isItalic={isItalic}
            isUnderline={isUnderline}
        />,
        document.body
    );
}

export default function TextFormatFloatingToolbarPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    return useTextFormatFloatingToolbar(editor);
}
