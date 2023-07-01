import * as FHIR from "@topical-ehr/fhir-types";
import { actions } from "@topical-ehr/fhir-store";
import { AnyAction } from "@topical-ehr/fhir-store/store";
import { Term } from "@topical-ehr/terminology/FhirTerminology";
import { Config } from "../../TopicsConfig";

export abstract class TopicItemStateBase {
    constructor(public readonly topic: FHIR.Composition, public config: Config) {}

    abstract doesApply(resource: FHIR.Resource | null): boolean;
    abstract getOptions(): TopicItemOptionBase[];
    abstract getSuggestedOptions(input: string): Promise<TopicItemOptionBase[]>;
    abstract icon: string;

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
            if (!fullySpecifiedName) {
                return [];
            }
            const termType = fullySpecifiedName?.slice(fullySpecifiedName.indexOf("(") + 1, -1);
            const options = makeOption(termType, term) ?? [];
            return options;
        }

        const options = vs.expansion?.contains?.flatMap(termToOptions) ?? [];
        return options;
    }
}

export abstract class TopicItemOptionBase {
    abstract onAdded(state: TopicItemStateBase): UpdateResult;
    abstract onRemoved(state: TopicItemStateBase): UpdateResult;

    public readonly key: string;
    public readonly value: TopicItemOptionBase;

    constructor(public readonly label: string, readonly keyData: any) {
        this.key = JSON.stringify(keyData);
        this.value = this;
    }
}

export type UpdateResult =
    | {
          newState: TopicItemStateBase;
          newActions: AnyAction[];
      }
    | { error: string };
