import { put, select } from "typed-redux-saga";

import * as FHIR from "@topical-ehr/fhir-types";
import { loadTopics } from "./Topic";
import { RootState } from "@topical-ehr/fhir-store/store";
import { defaultFormattingContext } from "@topical-ehr/formatting/formatting";
import { Codes } from "./fhirCodes";
import { actions } from "@topical-ehr/fhir-store";

export function* createTopicsForStandaloneConditionsSaga() {
    const resources = yield* select((s: RootState) => s.fhir.resources);
    const patientId = yield* select((s: RootState) => s.fhir.patientId);
    const { conditions, compositions, patients, medicationRequests: prescriptions } = resources;

    const fromCompositions = loadTopics(conditions, compositions, prescriptions);

    const conditionsInTopics = new Set(fromCompositions.flatMap((t) => t.conditions).map((c) => c.id));

    const conditionsWithoutTopics = Object.values(conditions).filter((c) => !conditionsInTopics.has(c.id));

    const newCompositions = conditionsWithoutTopics.map((c) => topicCompositionFromCondition(c, patients[patientId]));

    for (const composition of newCompositions) {
        yield put(actions.edit(composition));
    }
}

function topicCompositionFromCondition(condition: FHIR.Condition, patient: FHIR.Patient): FHIR.Composition {
    const title = condition.code ? defaultFormattingContext.code(condition.code).shortText : "Topic for un-coded Condition";

    const active = condition.clinicalStatus?.coding?.[0]?.code === "active";

    const newComposition = FHIR.Composition.new({
        subject: FHIR.referenceTo(patient),

        status: "preliminary",
        type: Codes.Composition.Type.Topic,
        date: new Date().toISOString(),
        category: [active ? Codes.Composition.Category.Active : Codes.Composition.Category.Inactive],
        title,
        section: [
            {
                entry: [FHIR.referenceTo(condition)],
            },
        ],
    });

    return newComposition;
}
