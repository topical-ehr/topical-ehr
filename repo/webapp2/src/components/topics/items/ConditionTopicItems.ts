import { actions } from "../../../redux/FhirState";
import {
    loadOptionsFromTerminology,
    SearchScope,
    searchTerminology,
} from "../../../utils/FhirTerminology";
import * as FHIR from "../../../utils/FhirTypes";
import { timingCodesAllowed } from "../../prescriptions/TimingCodes";
import { BlankTopicItemState } from "./BlankTopicItem";
import { TopicItemStateBase, TopicItemOptionBase, UpdateResult } from "./TopicItemBase";

export class ConditionTopicItemState extends TopicItemStateBase {
    doesApply(resource: FHIR.Resource | null): boolean {
        return resource?.resourceType === "Condition";
    }

    constructor(public readonly conditions: FHIR.Condition[], topic: FHIR.Composition) {
        super(topic);
    }

    async getOptions(input: string): Promise<TopicItemOptionBase[]> {
        return await loadOptionsFromTerminology(
            input,
            SearchScope.clinicalFinding,
            (termType, term) => {
                switch (termType) {
                    case "finding":
                    case "disorder":
                        return [new ConditionOption(term, this)];
                }
            }
        );
    }
}

export class ConditionOption extends TopicItemOptionBase {
    constructor(
        private term: FHIR.ValueSetCode,
        private state: ConditionTopicItemState | BlankTopicItemState
    ) {
        super(term.display, term);
    }

    onAdded(): UpdateResult {
        const { system, code, display } = this.term;
        const newCondition: FHIR.Condition = {
            ...FHIR.Condition.new({ subject: this.state.topic.subject }),
            code: {
                text: display,
                coding: [{ system, code, display, userSelected: true }],
            },
        };

        const newActions = [actions.edit(newCondition), this.state.addToComposition(newCondition)];
        if (this.state instanceof BlankTopicItemState) {
            return {
                newState: new ConditionTopicItemState([newCondition], this.state.topic),
                newActions,
            };
        } else {
            return {
                newState: new ConditionTopicItemState(
                    [...this.state.conditions, newCondition],
                    this.state.topic
                ),
                newActions,
            };
        }
    }

    onRemoved(): UpdateResult {
        if (this.state instanceof ConditionTopicItemState) {
            const removedCode = this.term.code;
            const toRemove = this.state.conditions.find(
                (condition) => condition.code?.coding?.[0].code === removedCode
            );
            if (!toRemove) {
                return { error: "unable to find existing condition" };
            }

            const conditions = this.state.conditions.filter((condition) => condition !== toRemove);

            return {
                newState:
                    conditions.length == 0
                        ? new BlankTopicItemState(this.state.topic)
                        : new ConditionTopicItemState(conditions, this.state.topic),
                newActions: [actions.delete(toRemove), this.state.removeFromComposition(toRemove)],
            };
        } else {
            throw new Error("unexpected state type");
        }
    }
}
