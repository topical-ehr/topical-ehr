import * as FHIR from "@topical-ehr/fhir-types";
import { logsFor } from "@topical-ehr/logging";
import { actions } from "@topical-ehr/fhir-store";
import { SearchScope } from "@topical-ehr/terminology/FhirTerminology";

import { BlankOrderState } from "../BlankOrder";
import { AutocompleteStateBase, AutocompleteOptionBase, UpdateResult } from "../AutocompleteBase";
import { Config } from "../AutocompleteConfig";

import iconDx from "/icons/dx.svg";

export class ConditionAutocompleteState extends AutocompleteStateBase {
    doesApply(resource: FHIR.Resource | null): boolean {
        return resource?.resourceType === "Condition";
    }

    icon = iconDx;

    constructor(public readonly conditions: FHIR.Condition[], topic: FHIR.Composition, config: Config) {
        super(topic, config);
    }

    getOptions() {
        return this.conditions
            .map((c) => {
                const coding = c?.code?.coding?.[0];
                return coding ? new ConditionOption(coding) : null;
            })
            .flatMap((c) => (c ? [c] : []));
    }

    async getSuggestedOptions(input: string): Promise<AutocompleteOptionBase[]> {
        return await this.loadOptionsFromTerminology(input, SearchScope.clinicalFinding, (termType, term) => {
            switch (termType) {
                case "finding":
                case "disorder":
                    return [new ConditionOption(term)];
            }
        });
    }
}

export class ConditionOption extends AutocompleteOptionBase {
    log = logsFor("ConditionOption");

    constructor(private term: Partial<FHIR.ValueSetCode>) {
        super(term.display ?? "(no display)", term);
        if (!term.display) {
            this.log.warn("no display for term", { term });
        }
    }

    onAdded(state: AutocompleteStateBase): UpdateResult {
        const { system, code, display } = this.term;
        const newCondition: FHIR.Condition = {
            ...FHIR.Condition.new({ subject: state.topic.subject }),
            code: {
                text: display,
                coding: [{ system, code, display, userSelected: true }],
            },
        };

        const newActions = [actions.edit(newCondition), state.addToComposition(newCondition)];
        if (state instanceof BlankOrderState) {
            return {
                newState: new ConditionAutocompleteState([newCondition], state.topic, state.config),
                newActions,
            };
        } else if (state instanceof ConditionAutocompleteState) {
            return {
                newState: new ConditionAutocompleteState([...state.conditions, newCondition], state.topic, state.config),
                newActions,
            };
        } else {
            throw this.log.exception("unexpected state type", { state });
        }
    }

    onRemoved(state: AutocompleteStateBase): UpdateResult {
        if (state instanceof ConditionAutocompleteState) {
            const removedCode = this.term.code;
            const toRemove = state.conditions.find((condition) => condition.code?.coding?.[0].code === removedCode);
            if (!toRemove) {
                return { error: "unable to find existing condition" };
            }

            const conditions = state.conditions.filter((condition) => condition !== toRemove);

            return {
                newState:
                    conditions.length == 0
                        ? new BlankOrderState(state.topic, state.config)
                        : new ConditionAutocompleteState(conditions, state.topic, state.config),
                newActions: [actions.delete(toRemove), state.removeFromComposition(toRemove)],
            };
        } else {
            throw new Error("unexpected state type");
        }
    }
}
