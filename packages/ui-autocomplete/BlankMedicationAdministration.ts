import * as FHIR from "@topical-ehr/fhir-types";
import { AutocompleteOptionBase, AutocompleteStateBase } from "./AutocompleteBase";
import { MedicationOption } from "./medications/MedicationAdministrationAutocomplete";

import icon from "/icons/bootstrap/plus.svg";
import { SearchScope } from "@topical-ehr/terminology/FhirTerminology";
import { Config } from "./AutocompleteConfig";

export class BlankMedicationAdministrationState extends AutocompleteStateBase {
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
        return await this.loadOptionsFromTerminology<AutocompleteOptionBase>(input, SearchScope.root, (termType, term) => {
            switch (termType) {
                case "substance":
                    return [new MedicationOption(term)];
            }
        });
    }
}
