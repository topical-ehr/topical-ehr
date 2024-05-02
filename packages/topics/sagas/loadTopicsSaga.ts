import { call, put, select, take } from "typed-redux-saga";

import * as FHIR from "@topical-ehr/fhir-types";
import { RootState } from "@topical-ehr/fhir-store/store";
import { actions } from "@topical-ehr/fhir-store";

import { waitForResourcesToLoadSaga } from "@topical-ehr/fhir-store";
import { loadTopics } from "../Topic";
import { topicsActions } from "@topical-ehr/fhir-store/topics-slice";

export function* loadTopicsSaga() {
    yield call(waitForResourcesToLoadSaga);

    yield call(loadTopicsInner);

    while (true) {
        const action = yield take(actions.edit.type);
        debugger;
        yield call(loadTopicsInner);
    }
}

export function* loadTopicsInner() {
    const resources = yield* select((s: RootState) => s.fhir.resourcesWithEdits);
    const { encounters, conditions, compositions, medicationRequests, tasks } = resources;

    const topics = loadTopics(
        compositions,
        encounters,
        conditions,
        medicationRequests,
        tasks
    );

    yield put(topicsActions.setTopics(topics));
}
