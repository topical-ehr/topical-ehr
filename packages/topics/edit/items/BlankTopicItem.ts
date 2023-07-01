import * as FHIR from "@topical-ehr/fhir-types";
import { TopicItemOptionBase, TopicItemStateBase } from "./TopicItemBase";
import { MedicationOption } from "./PrescriptionTopicItems";
import { ConditionOption } from "./ConditionTopicItems";

import icon from "/icons/bootstrap/plus.svg";
import { SearchScope } from "@topical-ehr/terminology/FhirTerminology";
import { Config } from "../../TopicsConfig";

export class BlankTopicItemState extends TopicItemStateBase {
    constructor(topic: FHIR.Composition, config: Config) {
        super(topic, config);
    }

    doesApply(resource: FHIR.Resource | null): boolean {
        return resource === null;
    }

    getOptions() {
        return [];
    }

    icon = icon;

    async getSuggestedOptions(input: string): Promise<TopicItemOptionBase[]> {
        return await this.loadOptionsFromTerminology<TopicItemOptionBase>(input, SearchScope.root, (termType, term) => {
            switch (termType) {
                case "finding":
                case "disorder":
                    return [new ConditionOption(term)];
                case "substance":
                    return [new MedicationOption(term)];
            }
        });
    }
}
