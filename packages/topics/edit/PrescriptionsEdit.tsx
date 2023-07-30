import { useTopicContext } from "../TopicContext";

import { useAutocompleteConfig } from "@topical-ehr/ui-autocomplete/AutocompleteConfig";
import { AutocompleteEditor } from "@topical-ehr/ui-autocomplete/AutocompleteEditor";
import { PrescriptionAutocompleteState } from "@topical-ehr/ui-autocomplete/medications/PrescriptionAutocomplete";
import { placeholder } from "./NewItem";

export function PrescriptionsEdit() {
    const config = useAutocompleteConfig();
    const context = useTopicContext();

    if (!context.editing) {
        return null;
    }

    return (
        <div>
            {context.topic.prescriptions.map((p) => (
                <AutocompleteEditor
                    key={p.id}
                    initialState={new PrescriptionAutocompleteState(p, context.topic.composition, config)}
                    index={0}
                    setHasData={nop}
                    placeholder={placeholder}
                />
            ))}
        </div>
    );
}

function nop() {}
