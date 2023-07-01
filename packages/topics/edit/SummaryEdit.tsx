import * as FHIR from "@topical-ehr/fhir-types";
import { actions } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import { RichTextEditor } from "@topical-ehr/rich-text-editor";
import { useTopicContext } from "../TopicContext";

interface Props {}

export function SummaryEdit(props: Props) {
    const dispatch = useAppDispatch();
    const context = useTopicContext();
    const { composition } = context.topic;

    const [initialHTML, _] = React.useState(composition.section?.[0].text?.div ?? null);

    function onTextChanged(html: string) {
        const updatedComposition = FHIR.Composition.setHTML(html, composition);
        dispatch(actions.edit(updatedComposition));
    }

    if (!context.editing) {
        return null;
    }

    return (
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
    );
}
