import { actions } from "../../../redux/FhirState";
import { loadOptionsFromTerminology, SearchScope } from "../../../utils/FhirTerminology";
import * as FHIR from "../../../utils/FhirTypes";
import { logsFor } from "../../../utils/logger";
import { BlankTopicItemState } from "./BlankTopicItem";
import { TopicItemStateBase, TopicItemOptionBase, UpdateResult } from "./TopicItemBase";

import iconDx from "/icons/dx.svg";

export class ConditionTopicItemState extends TopicItemStateBase {
    doesApply(resource: FHIR.Resource | null): boolean {
        return resource?.resourceType === "Condition";
    }

    icon = iconDx;

    constructor(public readonly conditions: FHIR.Condition[], topic: FHIR.Composition) {
        super(topic);
    }

    getOptions() {
        return this.conditions.map((c) => new ConditionOption(c.code.coding[0]));
    }

    async getSuggestedOptions(input: string): Promise<TopicItemOptionBase[]> {
        return await loadOptionsFromTerminology(
            input,
            SearchScope.clinicalFinding,
            (termType, term) => {
                switch (termType) {
                    case "finding":
                    case "disorder":
                        return [new ConditionOption(term)];
                }
            }
        );
    }
}

export class ConditionOption extends TopicItemOptionBase {
    log = logsFor("ConditionOption");

    constructor(private term: FHIR.ValueSetCode) {
        super(term.display, term);
    }

    onAdded(state: TopicItemStateBase): UpdateResult {
        const { system, code, display } = this.term;
        const newCondition: FHIR.Condition = {
            ...FHIR.Condition.new({ subject: state.topic.subject }),
            code: {
                text: display,
                coding: [{ system, code, display, userSelected: true }],
            },
        };

        const newActions = [actions.edit(newCondition), state.addToComposition(newCondition)];
        if (state instanceof BlankTopicItemState) {
            return {
                newState: new ConditionTopicItemState([newCondition], state.topic),
                newActions,
            };
        } else if (state instanceof ConditionTopicItemState) {
            return {
                newState: new ConditionTopicItemState(
                    [...state.conditions, newCondition],
                    state.topic
                ),
                newActions,
            };
        } else {
            throw this.log.exception("unexpected state type", { state });
        }
    }

    onRemoved(state: TopicItemStateBase): UpdateResult {
        if (state instanceof ConditionTopicItemState) {
            const removedCode = this.term.code;
            const toRemove = state.conditions.find(
                (condition) => condition.code?.coding?.[0].code === removedCode
            );
            if (!toRemove) {
                return { error: "unable to find existing condition" };
            }

            const conditions = state.conditions.filter((condition) => condition !== toRemove);

            return {
                newState:
                    conditions.length == 0
                        ? new BlankTopicItemState(state.topic)
                        : new ConditionTopicItemState(conditions, state.topic),
                newActions: [actions.delete(toRemove), state.removeFromComposition(toRemove)],
            };
        } else {
            throw new Error("unexpected state type");
        }
    }
}
