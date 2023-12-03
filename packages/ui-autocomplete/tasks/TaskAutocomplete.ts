import * as FHIR from "@topical-ehr/fhir-types";
import { logsFor } from "@topical-ehr/logging";
import { actions } from "@topical-ehr/fhir-store";

import { BlankOrderState } from "../BlankOrder";
import { AutocompleteStateBase, AutocompleteOptionBase, UpdateResult, InplaceEdit } from "../AutocompleteBase";
import { Config } from "../AutocompleteConfig";

import iconClipboard from "/icons/Nuvola_clipboard_unlined.svg";
import { newMeta } from "@topical-ehr/fhir-types";

export class TaskAutocompleteState extends AutocompleteStateBase {
    doesApply(resource: FHIR.Resource | null): boolean {
        return resource?.resourceType === "Task";
    }

    icon = iconClipboard;
    type = "text";

    constructor(public readonly task: FHIR.Task, topic: FHIR.Composition, config: Config) {
        super(topic, config);
    }

    getOptions() {
        return [new TaskOption(this.task.description ?? "")];
    }

    async getSuggestedOptions(input: string): Promise<AutocompleteOptionBase[]> {
        return [];
    }
}

export class TaskOption extends AutocompleteOptionBase {
    log = logsFor("TaskOption");

    constructor(private text: string) {
        super(text, text);
    }

    dropdownPrefix = "Create task: ";

    onAdded(state: AutocompleteStateBase): UpdateResult {
        const newTask: FHIR.Task = {
            resourceType: "Task",
            ...newMeta(),
            intent: "unknown",
            status: "requested",
            for: state.topic.subject,
            description: this.text,
        };

        if (state instanceof BlankOrderState) {
            return {
                newState: new TaskAutocompleteState(newTask, state.topic, state.config),
                newActions: [actions.edit(newTask), state.addToComposition(newTask)],
            };
        } else {
            throw this.log.exception("unexpected state type", { state });
        }
    }

    onRemoved(state: AutocompleteStateBase): UpdateResult {
        if (state instanceof TaskAutocompleteState) {
            const toRemove = state.task;
            return {
                newState: new BlankOrderState(state.topic, state.config),
                newActions: [actions.delete(toRemove), state.removeFromComposition(toRemove)],
            };
        } else {
            throw new Error("unexpected state type");
        }
    }

    inplaceEdit(): InplaceEdit {
        return {
            type: "textarea",
            initialValue: this.text,
            onSave(value, state: TaskAutocompleteState) {
                const newTask: FHIR.Task = {
                    ...state.task,
                    description: value,
                };
                return {
                    newState: new TaskAutocompleteState(newTask, state.topic, state.config),
                    newActions: [actions.edit(newTask)],
                };
            },
        };
    }
}
