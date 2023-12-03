import { useTopicContext } from "../TopicContext";

import { useAutocompleteConfig } from "@topical-ehr/ui-autocomplete/AutocompleteConfig";
import { AutocompleteEditor } from "@topical-ehr/ui-autocomplete/AutocompleteEditor";
import { placeholder } from "./NewItem";
import { TaskAutocompleteState } from "@topical-ehr/ui-autocomplete/tasks/TaskAutocomplete";

export function TasksEdit() {
    const config = useAutocompleteConfig();
    const context = useTopicContext();

    if (!context.editing) {
        return null;
    }

    if (context.topic.tasks.length > 0) {
    }

    return (
        <div>
            {context.topic.tasks.map((t) => (
                <AutocompleteEditor
                    key={t.id}
                    initialState={new TaskAutocompleteState(t, context.topic.composition, config)}
                    index={0}
                    setHasData={nop}
                    placeholder={placeholder}
                />
            ))}
        </div>
    );
}

function nop() {}
