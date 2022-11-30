import DOMPurify from "dompurify";
import { HoverButtonEdit, HoverButtons } from "../editing/HoverButtons";
import { Topic } from "../../utils/TopicGroup";
import { ConditionDisplay } from "./TopicItemDisplay";
import { useAppDispatch } from "../../redux/store";
import { actions } from "../../redux/FhirState";
import css from "./TopicDisplay.module.scss";

import cubesIcon from "/icons/cubes-Gnome-fs-blockdev.svg";

interface Props {
    topic: Topic;
}

export function TopicDisplay(props: Props) {
    const { composition, conditions } = props.topic;
    const dispatch = useAppDispatch();

    function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.ctrlKey) {
            alert(JSON.stringify(props.topic, null, 2));
        }
    }

    function onEdit() {
        dispatch(actions.editTopic(props.topic));
    }

    const html = composition?.section?.[0].text?.div ?? "";

    return (
        <div className={css.container} onClick={onContainerClick} onDoubleClick={onEdit}>
            <HoverButtons>
                <HoverButtonEdit onClick={onEdit} />
            </HoverButtons>

            {composition?.title && (
                <div className={css.title} title={`Topic: ${composition.title}`}>
                    <img src={cubesIcon} />
                    <h2>{composition.title}</h2>
                </div>
            )}

            <div
                className={css.summary}
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }),
                }}
            />

            {conditions.map((c) => (
                <ConditionDisplay key={c.id} condition={c} />
            ))}
        </div>
    );
}
