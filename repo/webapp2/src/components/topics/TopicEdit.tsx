import React from "react";
import { useDispatch } from "react-redux";
import { TextField } from "@fluentui/react";

import * as FHIR from "../../utils/FhirTypes";
import { Topic } from "../../utils/TopicGroup";
import { actions, useFHIR } from "../../redux/FhirState";
import { RichTextEditor } from "../editing/lexical/RichTextEditor";
import { HoverButtonDelete, HoverButtons, HoverButtonUndo } from "../editing/HoverButtons";

import css from "./TopicEdit.module.scss";
import { TopicItemEdit } from "./TopicItemEdit";
import { BlankTopicItemState } from "./items/BlankTopicItem";
import { ConditionTopicItemState } from "./items/ConditionTopicItems";

interface Props {
    topic: Topic;
}

export function TopicEdit(props: Props) {
    const topicId = props.topic.id;

    const editState = useFHIR((s) => s.fhir.editingTopics[topicId]);
    const composition = useFHIR((s) => s.fhir.edits.compositions[editState.compositionId]);
    const dispatch = useDispatch();

    const [initialHTML, _] = React.useState(composition.section?.[0].text?.div ?? null);

    React.useEffect(() => {
        console.log("TopicEdit mounted");
    }, []);

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
    function onTextChanged(html: string) {
        const updatedComposition = FHIR.Composition.setHTML(html, composition);
        dispatch(actions.edit(updatedComposition));
    }

    function onUndo() {
        dispatch(actions.undoEditTopic(props.topic));
    }
    function onDelete() {}

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
                    errorMessage=""
                    value={composition?.title}
                    onChange={onTitleChanged}
                    className={css.titleTextbox}
                />
            </div>

            <RichTextEditor
                initialHTML={initialHTML}
                placeholder={
                    <>
                        <p>Summary</p>
                        <p></p>
                        <p># Heading</p>
                        <p>Details</p>
                    </>
                }
                onChangedHTML={onTextChanged}
            />

            {props.topic.conditions.map((c) => (
                <ConditionEdit key={c.id} condition={c} />
            ))}

            {props.topic.conditions.map((c) => (
                <TopicItemEdit
                    key={c.id}
                    compositionId={editState.compositionId}
                    initialState={new ConditionTopicItemState([c], composition)}
                    index={0}
                    setHasData={nop}
                />
            ))}

            <NewItemEditControls
                composition={composition}
                compositionId={editState.compositionId}
            />

            {/* <Stack horizontal tokens={{ childrenGap: 10 }} className={css.bottomButtons}>
                <PrimaryButton text="Add condition" onClick={onAddCondition} />
                <PrimaryButton text="Add medication" onClick={onAddMedication} />
            </Stack> */}
        </div>
    );
}

function NewItemEditControls(props: { composition: FHIR.Composition; compositionId: string }) {
    const [hasData, setHasData] = React.useState<boolean[]>([false]);

    const setHasDataFor = React.useCallback((index: number, newValue: boolean) => {
        // console.log("setHasDataFor", index, newValue);
        setHasData((old) => {
            if (old[index] === newValue) {
                // unchanged
                return old;
            }

            const newHasData = old.map((val, i) => (index === i ? newValue : val));

            const lastValue = newHasData.slice(-1)[0];
            if (lastValue === true) {
                // add blank control
                return [...newHasData, false];
            }

            if (newHasData.length >= 2) {
                const secondLastValue = newHasData.slice(-2)[0];
                if (lastValue == false && secondLastValue == false) {
                    // remove duplicate blank control
                    return newHasData.slice(0, -1);
                }
            }

            return newHasData;
        });
    }, []);

    const blankState = new BlankTopicItemState(props.composition);

    return (
        <div>
            {hasData.map((_, i) => (
                <TopicItemEdit
                    key={i}
                    {...props}
                    index={i}
                    setHasData={setHasDataFor}
                    initialState={blankState}
                />
            ))}
        </div>
    );
}

function nop() {}
