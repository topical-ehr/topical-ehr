import { AnyAction } from "@reduxjs/toolkit";
import { actions } from "../../../redux/FhirState";
import * as FHIR from "../../../utils/FhirTypes";

export type UpdateResult =
    | {
          newState: TopicItemStateBase;
          newActions: AnyAction[];
      }
    | { error: string };

export abstract class TopicItemStateBase {
    abstract doesApply(resource: FHIR.Resource | null): boolean;

    abstract getOptions(input: string): Promise<TopicItemOptionBase[]>;

    constructor(public readonly topic: FHIR.Composition) {}

    addToComposition(resource: FHIR.Resource) {
        const updatedComposition = FHIR.Composition.addEntry(
            FHIR.referenceTo(resource),
            this.topic
        );
        return actions.edit(updatedComposition);
    }
    removeFromComposition(resource: FHIR.Resource) {
        const updatedComposition = FHIR.Composition.removeEntry(
            FHIR.referenceTo(resource),
            this.topic
        );
        return actions.edit(updatedComposition);
    }
}

export abstract class TopicItemOptionBase {
    abstract onAdded(): UpdateResult;
    abstract onRemoved(): UpdateResult;

    public readonly key: string;
    public readonly value: TopicItemOptionBase;

    constructor(public readonly label: string, readonly keyData: any) {
        this.key = JSON.stringify(keyData);
        this.value = this;
    }
}
