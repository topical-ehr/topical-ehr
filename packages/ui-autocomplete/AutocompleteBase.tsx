import * as FHIR from "@topical-ehr/fhir-types";
import { actions } from "@topical-ehr/fhir-store";
import { AnyAction } from "@topical-ehr/fhir-store/store";
import { Term } from "@topical-ehr/terminology/FhirTerminology";
import { Config } from "./AutocompleteConfig";

export abstract class AutocompleteStateBase {
    constructor(public readonly topic: FHIR.Composition, public config: Config) {}

    abstract doesApply(resource: FHIR.Resource | null): boolean;
    abstract getOptions(): AutocompleteOptionBase[];
    abstract getSuggestedOptions(input: string): Promise<AutocompleteOptionBase[]>;
    abstract icon: string;

    type = "select";

    addToComposition(resource: FHIR.Resource) {
        const updatedComposition = FHIR.Composition.addEntry(FHIR.referenceTo(resource), this.topic);
        return actions.edit(updatedComposition);
    }
    removeFromComposition(resource: FHIR.Resource) {
        const updatedComposition = FHIR.Composition.removeEntry(FHIR.referenceTo(resource), this.topic);
        return actions.edit(updatedComposition);
    }

    async loadOptionsFromTerminology<T>(
        input: string,
        searchScope: string,
        makeOption: (termType: string, term: Term) => T[] | undefined
    ): Promise<T[]> {
        if (input.length < this.config.minInputLengthForSearch) {
            return [];
        }

        const vs = await this.config.searchTerminology(input, searchScope);

        function termToOptions(term: Term): T[] {
            const fullySpecifiedName = term.designation?.find((d) => d.use?.code === "900000000000003001")?.value;
            console.debug("termToOptions", { term, fullySpecifiedName });
            if (!fullySpecifiedName) {
                return [];
            }
            const termType = fullySpecifiedName?.slice(fullySpecifiedName.indexOf("(") + 1, -1);
            const options = makeOption(termType, term) ?? [];
            console.debug("termToOptions", { termType, options });
            return options;
        }

        const options = vs.expansion?.contains?.flatMap(termToOptions) ?? [];
        return options;
    }
}

export abstract class AutocompleteOptionBase {
    abstract onAdded(state: AutocompleteStateBase): UpdateResult;
    abstract onRemoved(state: AutocompleteStateBase): UpdateResult;
    abstract inplaceEdit(): InplaceEdit;

    public readonly key: string;
    public readonly value: AutocompleteOptionBase;

    constructor(public readonly label: string, readonly keyData: any) {
        this.key = JSON.stringify(keyData);
        this.value = this;
    }
}

export type UpdateResult =
    | {
          newState: AutocompleteStateBase;
          newActions: AnyAction[];
      }
    | { error: string };

export type InplaceEditText = {
    type: "textarea";
    initialValue: string;
    onSave(value: string, state: AutocompleteStateBase): UpdateResult;
};
export type InplaceEdit = InplaceEditText | "remove-me" | "disallow";
