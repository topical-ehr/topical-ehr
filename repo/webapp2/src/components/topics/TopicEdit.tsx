import { DefaultButton, PrimaryButton, Stack, TextField } from "@fluentui/react";

import { Topic } from "../../utils/topics";
import { ConditionDisplay } from "./ConditionDisplay";
import { useFHIR } from "../../redux/FhirState";
import css from "./TopicEdit.module.scss";

interface Props {
    topic: Topic;
}

export function TopicEdit(props: Props) {
    const topicId = props.topic.id;

    const editState = useFHIR((s) => s.fhir.editingTopics[topicId]);
    const composition = useFHIR((s) => s.fhir.resources.compositions[editState.compositionId]);

    function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.ctrlKey) {
            alert(JSON.stringify(props.topic, null, 2));
        }
    }

    function onTitleChanged(
        event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
        newValue?: string
    ) {}

    return (
        <div className={css.container} onClick={onContainerClick}>
            <TextField
                label=""
                placeholder="Topic title"
                errorMessage=" "
                defaultValue={composition.title}
                onChange={onTitleChanged}
            />

            <h5>Conditions</h5>
            {props.topic.conditions.map((c) => (
                <ConditionDisplay key={c.id} condition={c} />
            ))}

            <Stack horizontal tokens={{ childrenGap: 10 }}>
                <PrimaryButton text="Save" onClick={() => {}} />
                <DefaultButton text="Cancel" onClick={() => {}} />
                <DefaultButton text="Delete" onClick={() => {}} />
            </Stack>
        </div>
    );
}
