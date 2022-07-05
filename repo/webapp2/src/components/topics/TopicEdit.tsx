import { DefaultButton, PrimaryButton, Stack, TextField } from "@fluentui/react";

import { Topic } from "../../utils/topics";
import { ConditionDisplay } from "./ConditionDisplay";
import { useFHIR } from "../../redux/FhirState";
import css from "./TopicEdit.module.scss";
import { RichTextEditor } from "../editing/lexical/RichTextEditor";
import React from "react";
import { LexicalEditor } from "lexical";
import { $convertToMarkdownString } from "@lexical/markdown";
import {
    HoverButtonDelete,
    HoverButtonEdit,
    HoverButtons,
    HoverButtonUndo,
} from "../editing/HoverButtons";

interface Props {
    topic: Topic;
}

export function TopicEdit(props: Props) {
    const topicId = props.topic.id;

    const editState = useFHIR((s) => s.fhir.editingTopics[topicId]);
    const composition = useFHIR((s) => s.fhir.resources.compositions[editState.compositionId]);

    const editorRef = React.useRef<LexicalEditor>();

    function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.ctrlKey) {
            alert(JSON.stringify(props.topic, null, 2));
        }
    }

    function onTitleChanged(
        event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
        newValue?: string
    ) {}

    function onSave() {
        editorRef.current?.update(() => {
            const markdown = $convertToMarkdownString();
            alert(markdown);
        });
    }

    const placeholder = (
        <>
            <p>Summary</p>
            <p></p>
            <p># Heading</p>
            <p>Details</p>
        </>
    );

    return (
        <div className={css.container} onClick={onContainerClick}>
            <HoverButtons>
                <HoverButtonDelete onClick={onSave} />
                <HoverButtonUndo onClick={onSave} />
            </HoverButtons>

            <div className={css.horizontalLabel}>
                <h5>Topic Title</h5>
                <TextField
                    label=""
                    errorMessage=" "
                    defaultValue={composition.title}
                    onChange={onTitleChanged}
                />
            </div>

            <RichTextEditor
                initialMarkdown="Summary"
                placeholder={placeholder}
                setEditor={(editor) => (editorRef.current = editor)}
            />

            {props.topic.conditions.map((c) => (
                <ConditionDisplay key={c.id} condition={c} />
            ))}

            <Stack horizontal tokens={{ childrenGap: 10 }}>
                <PrimaryButton text="Add condition" onClick={onSave} />
                <PrimaryButton text="Add medication" onClick={onSave} />
            </Stack>
        </div>
    );
}
