import { HoverButtonEdit, HoverButtons } from "../editing/HoverButtons";
import { Topic } from "../../utils/topics";
import { ConditionDisplay } from "./ConditionDisplay";
import { useAppDispatch } from "../../redux/store";
import { actions } from "../../redux/FhirState";
import css from "./TopicDisplay.module.scss";

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

    return (
        <div className={css.container} onClick={onContainerClick} onDoubleClick={onEdit}>
            <HoverButtons>
                <HoverButtonEdit onClick={onEdit} />
            </HoverButtons>
            {composition?.title && <h2>{composition.title}</h2>}

            {conditions.map((c) => (
                <ConditionDisplay key={c.id} condition={c} />
            ))}
        </div>
    );
}
