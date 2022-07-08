import React from "react";
import { DefaultButton, PrimaryButton, Stack, TextField } from "@fluentui/react";
import { $convertToMarkdownString } from "@lexical/markdown";
import { LexicalEditor } from "lexical";

import * as FHIR from "../../utils/FhirTypes";
import { Topic } from "../../utils/topics";
import { ConditionDisplay } from "./ConditionDisplay";
import { actions, useFHIR } from "../../redux/FhirState";
import { RichTextEditor } from "../editing/lexical/RichTextEditor";
import { HoverButtonDelete, HoverButtons, HoverButtonUndo } from "../editing/HoverButtons";

import css from "./TopicEdit.module.scss";
import { useDispatch } from "react-redux";
import { ConditionEdit } from "./ConditionEdit";
import { ConditionAdd } from "./ConditionAdd";

interface Props {
    topic: Topic;
}

export function TopicEdit(props: Props) {
    const topicId = props.topic.id;

    const editState = useFHIR((s) => s.fhir.editingTopics[topicId]);
    const composition = useFHIR((s) => s.fhir.edits.compositions[editState.compositionId]);

    const dispatch = useDispatch();
    const editorRef = React.useRef<LexicalEditor>();

    function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.ctrlKey) {
            alert(JSON.stringify(props.topic, null, 2));
        }
    }

    function onTitleChanged(
        event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
        newValue?: string
    ) {
        dispatch(
            actions.edit({
                ...composition,
                title: newValue,
            } as FHIR.Resource)
        );
    }

    function onSave() {
        editorRef.current?.update(() => {
            const markdown = $convertToMarkdownString();
            alert(markdown);
        });
    }
    function onUndo() {
        dispatch(actions.undoEditTopic(props.topic));
    }
    function onDelete() {}

    function onAddCondition() {
        const newCondition = FHIR.Condition.new({ subject: composition.subject });

        const updatedComposition = FHIR.Composition.addEntry(
            FHIR.referenceTo(newCondition),
            composition
        );

        dispatch(actions.edit(newCondition));
        dispatch(actions.edit(updatedComposition));
    }
    function onAddMedication() {}

    const placeholder = (
        <>
            <p>Summary</p>
            <p></p>
            <p># Heading</p>
            <p>Details</p>
        </>
    );

    const addedConditions = (composition.section ?? [])
        .flatMap((s) => s.entry)
        .flatMap((r) => (r?.reference ? [r?.reference] : []))
        .filter((r) => r.startsWith("Condition/urn:"));

    return (
        <div className={css.container} onClick={onContainerClick}>
            <HoverButtons>
                <HoverButtonDelete onClick={onDelete} />
                <HoverButtonUndo onClick={onUndo} title="Undo all edits" />
            </HoverButtons>

            <div className={css.horizontalLabel}>
                <h5>Topic title</h5>
                <TextField
                    label=""
                    errorMessage=" "
                    value={composition.title}
                    onChange={onTitleChanged}
                    className={css.titleTextbox}
                />
            </div>

            <RichTextEditor
                initialMarkdown="Summary"
                placeholder={placeholder}
                setEditor={(editor) => (editorRef.current = editor)}
            />

            {props.topic.conditions.map((c) => (
                <ConditionEdit key={c.id} condition={c} />
            ))}
            {addedConditions.map((id) => (
                <ConditionAdd conditionId={id} />
            ))}

            <Stack horizontal tokens={{ childrenGap: 10 }}>
                <PrimaryButton text="Add condition" onClick={onAddCondition} />
                <PrimaryButton text="Add medication" onClick={onAddMedication} />
            </Stack>
        </div>
    );
}
