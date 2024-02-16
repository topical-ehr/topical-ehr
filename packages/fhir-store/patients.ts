import { PayloadAction } from "@reduxjs/toolkit";
import { put, take, takeEvery } from "redux-saga/effects";
import { call, select } from "typed-redux-saga";

import * as FHIR from "@topical-ehr/fhir-types";
import { Codes } from "@topical-ehr/fhir-types/FhirCodes";

import { FhirServerMethods } from "./fhir-server";
import { QueryRequest, actions, emptyResources } from "./fhir-state";
import type { RootState } from "./store";

export function* loadPatientResourcesSaga() {
    console.log("loadPatientResourcesSaga running");
    const { patientId, practitionerId } = yield* select((s: RootState) => s.fhir);

    for (const key of Object.keys(emptyResources)) {
        // uppercase first letter, and remove trailing s
        const resourceType = key.charAt(0).toUpperCase() + key.slice(1, -1);

        function searchUrl() {
            if (resourceType === "Patient") {
                return `Patient/${patientId}`;
            } else {
                return `${resourceType}?subject=Patient/${patientId}`;
            }
        }
        console.log("loading", searchUrl());
        yield put(
            actions.query({ id: "load-all", query: searchUrl(), showLoadingScreen: true })
        );
    }

    yield put(
        actions.query({
            id: "get-unread",
            query: `List?subject=Patient/${patientId}&source=Practitioner/${practitionerId}&code=unread`,
            showLoadingScreen: true,
        })
    );
}

export function* unreadListSaga(fhirServer: FhirServerMethods) {
    yield takeEvery(actions.queryLoaded.type, unreadListQueryLoadedSaga, fhirServer);
}

function* unreadListQueryLoadedSaga(
    fhirServer: FhirServerMethods,
    action: PayloadAction<[QueryRequest, FHIR.Resource[]]>
) {
    const [request, resources] = action.payload;

    // this saga is called in response to query-loaded
    // it cares about the get-unread query
    if (request.id !== "get-unread") {
        return;
    }

    if (resources.length === 0) {
        // unread list doesn't exist yet
        console.debug("unread list doesn't exist yet");

        // wait for FHIR queries to load
        while (true) {
            const queries = yield* select((s: RootState) => s.fhir.queries);
            if (
                Object.values(queries).filter((q) => q.state === "loading").length === 0
            ) {
                break;
            } else {
                yield take(actions.queryLoaded.type);
            }
        }

        const resourcesMap = yield* select((s: RootState) => s.fhir.resourcesFromServer);
        const resources2 = [
            resourcesMap.observations,
            resourcesMap.compositions,
            resourcesMap.diagnosticReports,
        ].map(Object.values<FHIR.Resource>);

        const { patientId, practitionerId } = yield* select((s: RootState) => s.fhir);

        const newList: FHIR.List = {
            resourceType: "List",
            ...FHIR.newMeta(),
            status: "current",
            mode: "working",
            code: Codes.List.Unread,
            entry: resources2.flatMap((r) =>
                r.map((r) => ({
                    item: FHIR.referenceTo(r),
                }))
            ),
            subject: { reference: `Patient/${patientId}` },
            source: { reference: `Practitioner/${practitionerId}` },
        };

        const response: FHIR.Resource = yield* call(fhirServer.post, newList);
        if (response.resourceType !== "List") {
            console.error("unreadListSaga failed to save the List", {
                response,
                newList,
            });
            throw new Error("unreadListSaga failed to save the List");
        }

        yield put(actions.updateUnread(newList));
    } else {
        const list = resources[0];
        if (FHIR.isList(list) && list.code?.coding?.[0].code === "unread") {
            console.debug("unread list loaded", { list });
            yield put(actions.updateUnread(list));
        } else {
            console.warn("get-unread got an invalid list", { list });
        }
    }
}
