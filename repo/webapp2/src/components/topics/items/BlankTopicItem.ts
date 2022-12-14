import { TopicItemOptionBase, TopicItemStateBase } from "./TopicItemBase";
import * as FHIR from "../../../utils/FhirTypes";
import { loadOptionsFromTerminology, SearchScope } from "../../../utils/FhirTerminology";
import { MedicationOption } from "./PrescriptionTopicItems";
import { ConditionOption } from "./ConditionTopicItems";

export class BlankTopicItemState extends TopicItemStateBase {
    doesApply(resource: FHIR.Resource | null): boolean {
        return resource === null;
    }

    constructor(topic: FHIR.Composition) {
        super(topic);
    }

    getOptions() {
        return [];
    }

    async getSuggestedOptions(input: string): Promise<TopicItemOptionBase[]> {
        return await loadOptionsFromTerminology<TopicItemOptionBase>(
            input,
            SearchScope.root,
            (termType, term) => {
                switch (termType) {
                    case "finding":
                    case "disorder":
                        return [new ConditionOption(term)];
                    case "substance":
                        return [new MedicationOption(term)];
                }
            }
        );
    }
}
