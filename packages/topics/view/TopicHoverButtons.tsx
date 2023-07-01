import { actions } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import { HoverButtonDelete, HoverButtonEdit, HoverButtonUndo, HoverButtons } from "@topical-ehr/ui-elements/HoverButtons";
import { useTopicContext } from "../TopicContext";

interface Props {}

export function TopicHoverButtons(props: Props) {
    const dispatch = useAppDispatch();
    const context = useTopicContext();
    const { editing } = context;

    function onEdit() {
        dispatch(actions.edit(context.topic.composition));
    }
    function onDelete() {
        dispatch(actions.delete(context.topic.composition));
    }
    function onUndo() {
        dispatch(actions.undoEdits(context.topic.composition));
    }

    return (
        <div>
            <HoverButtons>
                {!editing && <HoverButtonEdit onClick={onEdit} />}
                {editing && <HoverButtonDelete onClick={onDelete} />}
                {editing && (
                    <HoverButtonUndo
                        onClick={onUndo}
                        title="Undo all edits"
                    />
                )}
            </HoverButtons>
        </div>
    );
}
