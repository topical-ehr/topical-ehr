import React from "react";

import * as FHIR from "@topical-ehr/fhir-types";
import { useFormatting } from "@topical-ehr/formatting/formatting";
import { useTopicContext } from "../TopicContext";
import css from "./TopicItemDisplay.module.scss";
import iconClipboard from "/icons/Nuvola_clipboard_unlined.svg";

export function TasksView() {
    const context = useTopicContext();

    if (context.editing) {
        return null;
    }

    return (
        <div>
            {context.topic.tasks.map((r) => (
                <TaskView
                    key={r.id}
                    task={r}
                />
            ))}
        </div>
    );
}

interface Props {
    task: FHIR.Task;
    deleted?: boolean;
}
function TaskView(props: Props) {
    const formatting = useFormatting();

    const { task } = props;

    function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.ctrlKey) {
            alert(JSON.stringify(task, null, 2));
        }
    }

    return (
        <div
            title="Task"
            className={css.container}
            onClick={onContainerClick}
        >
            <div className={props.deleted ? css.deleted : ""}>
                <span className={css.title}>
                    <img
                        src={iconClipboard}
                        style={{ height: "1.3em" }}
                    />
                    {task.description}
                </span>
            </div>
        </div>
    );
}
