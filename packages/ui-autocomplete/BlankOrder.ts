import * as FHIR from "@topical-ehr/fhir-types";
import { AutocompleteOptionBase, AutocompleteStateBase } from "./AutocompleteBase";
import { MedicationOption } from "./medications/PrescriptionAutocomplete";
import { ConditionOption } from "./conditions/ConditionAutocomplete";

import icon from "/icons/bootstrap/plus.svg";
import { SearchScope } from "@topical-ehr/terminology/FhirTerminology";
import { Config } from "./AutocompleteConfig";
import { TaskOption } from "./tasks/TaskAutocomplete";

export class BlankOrderState extends AutocompleteStateBase {
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

    async getSuggestedOptions(input: string): Promise<AutocompleteOptionBase[]> {
        const options = await this.loadOptionsFromTerminology<AutocompleteOptionBase>(
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

        if (options.length == 0 && input.length > 5) {
            return [new TaskOption(input)];
        }

        return options;
    }
}
