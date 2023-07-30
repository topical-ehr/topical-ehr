import { useTopicContext } from "../TopicContext";

import { useAutocompleteConfig } from "@topical-ehr/ui-autocomplete/AutocompleteConfig";
import { AutocompleteEditor } from "@topical-ehr/ui-autocomplete/AutocompleteEditor";
import { ConditionAutocompleteState } from "@topical-ehr/ui-autocomplete/conditions/ConditionAutocomplete";
import { placeholder } from "./NewItem";

export function ConditionsEdit() {
    const config = useAutocompleteConfig();
    const context = useTopicContext();

    if (!context.editing) {
        return null;
    }

    return (
        <div>
            {context.topic.conditions.map((c) => (
                <AutocompleteEditor
                    key={c.id}
                    initialState={new ConditionAutocompleteState([c], context.topic.composition, config)}
                    index={0}
                    setHasData={nop}
                    placeholder={placeholder}
                />
            ))}
        </div>
    );
}

function nop() {}
