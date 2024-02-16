import { put } from "redux-saga/effects";

import { actions } from "./fhir-state";

export function* loadPatientsBoardSaga() {
    console.log("loadPatientsBoardSaga running");

    yield put(
        actions.query({
            id: "load-patients",
            query: "Patient",
            showLoadingScreen: true,
        })
    );
    yield put(
        actions.query({
            id: "load-patients-lists",
            query: "List?code=patients",
            showLoadingScreen: true,
        })
    );
}
