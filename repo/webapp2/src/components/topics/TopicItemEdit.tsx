import { useDispatch } from "react-redux";
import { actions, useFHIR } from "../../redux/FhirState";
import * as FHIR from "../../utils/FhirTypes";
import { HoverButtonDelete, HoverButtonUndo } from "../editing/HoverButtons";
import { ConditionDisplay } from "./TopicItemDisplay";
import css from "./TopicItemEdit.module.scss";

interface Props {
    condition: FHIR.Condition;
}

export function ConditionEdit(props: Props) {
    const dispatch = useDispatch();

    const typeId = FHIR.referenceTo(props.condition).reference;
    const deleted = useFHIR((s) => !!s.fhir.deletions[typeId]);

    function onDelete() {
        dispatch(actions.delete(props.condition));
    }
    function onUndoDelete() {
        dispatch(actions.undoDelete(props.condition));
    }

    return (
        <div className={css.conditionEdit}>
            <ConditionDisplay condition={props.condition} deleted={deleted} />
            {!deleted && <HoverButtonDelete onClick={onDelete} />}
            {deleted && <HoverButtonUndo onClick={onUndoDelete} title="Undo delete" />}
        </div>
    );
}
