import React from "react";

import { useAutocompleteConfig } from "@topical-ehr/ui-autocomplete/AutocompleteConfig";
import { NewAutocompleteEditors } from "@topical-ehr/ui-autocomplete/NewAutocompleteEditors";
import { BlankOrderState } from "@topical-ehr/ui-autocomplete/BlankOrder";

import { useTopicContext } from "../TopicContext";

export const placeholder = "Add tasks, prescriptions, diagnoses";

export function NewItem() {
    const context = useTopicContext();
    const config = useAutocompleteConfig();

    if (!context.editing) {
        return null;
    }

    const blankState = new BlankOrderState(context.topic.composition, config);

    return (
        <div>
            <NewAutocompleteEditors
                placeholder={placeholder}
                initialState={blankState}
            />
        </div>
    );
}
