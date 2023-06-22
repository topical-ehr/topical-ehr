import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import * as Redux from "react-redux";
import { fork, put, takeEvery } from "redux-saga/effects";
import { call, select } from "typed-redux-saga";

import { fetchFHIR, postFHIR } from "@topical-ehr/fhir-server-http";
import * as FHIR from "@topical-ehr/fhir-types";
import { FhirResourceById } from "@topical-ehr/fhir-types";
import { Topic } from "@topical-ehr/topics/TopicGroup";

import type { RootState } from "./store";
import { EHRConfig } from "./config";

interface QueryRequest {
    query: string;
    showLoadingScreen: boolean;
}
type QueryState =
    | { state: "loading"; showLoadingScreen: boolean }
    | { state: "error"; error: unknown }
    | { state: "loaded" };

type SaveState =
    | { state: "save-requested" }
    | { state: "saving" }
    | { state: "error"; error: unknown }
    | { state: "saved" };

export type FhirModification =
    | {
          type: "added";
          draft: FHIR.Resource;
      }
    | {
          type: "edited";
          draft: FHIR.Resource;
      };

export interface FhirResources<T = never> {
    compositions: FhirResourceById<FHIR.Composition | T>;
    conditions: FhirResourceById<FHIR.Condition | T>;
    patients: FhirResourceById<FHIR.Patient | T>;
    observations: FhirResourceById<FHIR.Observation | T>;
    diagnosticReports: FhirResourceById<FHIR.DiagnosticReport | T>;
    medicationRequests: FhirResourceById<FHIR.MedicationRequest | T>;
    serviceRequests: FhirResourceById<FHIR.ServiceRequest | T>;
}
const emptyResources: FhirResources = {
    compositions: {},
    conditions: {},
    patients: {},
    observations: {},
    diagnosticReports: {},
    medicationRequests: {},
    serviceRequests: {},
};

function getResourceContainer(resources: WritableDraft<FhirResources>, resourceType: string) {
    switch (resourceType) {
        case "Composition":
            return resources.compositions;
        case "Condition":
            return resources.conditions;
        case "Patient":
            return resources.patients;
        case "Observation":
            return resources.observations;
        case "DiagnosticReport":
            return resources.diagnosticReports;
        case "MedicationRequest":
            return resources.medicationRequests;
        case "ServiceRequest":
            return resources.serviceRequests;
        default:
            throw new Error(`No state object for resource ${resourceType}`);
    }
}

function setResource(resources: WritableDraft<FhirResources>, r: FHIR.Resource) {
    const container = getResourceContainer(resources, r.resourceType);
    // @ts-expect-error
    container[r.id] = r;
}

function deleteResource(resources: WritableDraft<FhirResources>, r: FHIR.Resource) {
    const container = getResourceContainer(resources, r.resourceType);
    delete container[r.id];
}

export interface State {
    queries: {
        [query: string]: QueryState;
    };
    resources: FhirResources;
    byCode: {
        observations: Map<string, FHIR.Observation[]>;
    };

    edits: FhirResources;
    deletions: FhirResourceById<FHIR.Resource>;

    patientId: string;

    editingTopics: {
        [topicId: string]: {
            // composition id is null for topics that have been
            // generated from standalone conditions
            compositionId: string;
        };
    };
    saveState: SaveState | null;
}

export function initialState(config?: EHRConfig): State {
    return {
        queries: {},
        resources: emptyResources,
        edits: emptyResources,
        deletions: {},
        editingTopics: {},
        saveState: null,
        byCode: {
            observations: new Map(),
        },

        // set by preloadedState
        patientId: config?.patientId ?? "",
    };
}

export const fhirSlice = createSlice({
    name: "FHIR",
    initialState: initialState(undefined),
    reducers: {
        query(state, action: PayloadAction<QueryRequest>) {
            // handled by the saga
        },
        queryLoading(state, action: PayloadAction<QueryRequest>) {
            const { query, showLoadingScreen } = action.payload;
            state.queries[query] = { state: "loading", showLoadingScreen };
        },
        queryLoaded(state, action: PayloadAction<[string, FHIR.Resource[]]>) {
            const [query, resources] = action.payload;
            for (const resource of resources) {
                setResource(state.resources, resource);
            }
            state.queries[query] = { state: "loaded" };
        },
        queryError(state, action: PayloadAction<[string, unknown]>) {
            const [query, error] = action.payload;
            state.queries[query] = {
                state: "error",
                error,
            };
        },

        edit(state, action: PayloadAction<FHIR.Resource>) {
            setResource(state.edits, action.payload);
            state.saveState = null;
        },
        undoEdits(state, action: PayloadAction<FHIR.Resource>) {
            deleteResource(state.edits, action.payload);
        },

        delete(state, action: PayloadAction<FHIR.Resource>) {
            const resource = action.payload;
            state.deletions[FHIR.referenceTo(resource).reference] = resource;
            state.saveState = null;
        },
        undoDelete(state, action: PayloadAction<FHIR.Resource>) {
            const resource = action.payload;
            delete state.deletions[FHIR.referenceTo(resource).reference];
        },

        newTopic(state, action: PayloadAction<void>) {
            const now = new Date().toISOString();
            const newComposition = FHIR.Composition.new({
                subject: { reference: `Patient/${state.patientId}` },
                status: "preliminary",
                type: { text: "topic" },
                date: now,
                title: "New topic",
                section: [{}],
            });
            state.editingTopics[newComposition.id] = {
                compositionId: newComposition.id,
            };
            state.resources.compositions[newComposition.id] = newComposition;
            state.edits.compositions[newComposition.id] = newComposition;
        },

        editTopic(state, action: PayloadAction<Topic>) {
            const topic = action.payload;
            const composition = topic.composition;

            state.editingTopics[topic.id] = {
                compositionId: composition.id,
            };
            setResource(state.edits, JSON.parse(JSON.stringify(composition)));

            state.saveState = null;
        },
        undoEditTopic(state, action: PayloadAction<Topic>) {
            const topic = action.payload;

            const compositionId = state.editingTopics[topic.id].compositionId;

            delete state.editingTopics[topic.id];
            delete state.edits.compositions[compositionId];
        },
        setSaveState(state, action: PayloadAction<SaveState>) {
            state.saveState = action.payload;

            if (state.saveState.state === "saved") {
                for (const key of Object.keys(state.edits)) {
                    // @ts-ignore
                    const edited = state.edits[key];
                    for (const resource of Object.values(edited)) {
                        // @ts-ignore
                        setResource(state.resources, resource);
                    }
                }

                state.editingTopics = {};
            }
        },
        undoAll(state, action: PayloadAction<void>) {
            for (const key of Object.keys(state.edits)) {
                // @ts-ignore
                state.edits[key] = {};
            }

            state.editingTopics = {};
        },

        setObservationsByCode(state, action: PayloadAction<Map<string, FHIR.Observation[]>>) {
            state.byCode.observations = action.payload;
        },
    },
});

function* onQuery(action: PayloadAction<QueryRequest>) {
    const { query, showLoadingScreen } = action.payload;
    const state = yield* select((s: RootState) => s.fhir.queries[query]);
    if (!state) {
        yield put(actions.queryLoading(action.payload));

        try {
            // Call FHIR server
            const data: FHIR.Resource = yield* call(fetchFHIR, query);
            if (FHIR.isBundle(data)) {
                yield put(actions.queryLoaded([query, data.entry?.map((e) => e.resource) || []]));
            } else {
                yield put(actions.queryLoaded([query, [data]]));
            }
        } catch (err) {
            console.error("FHIR error", query, err);
            yield put(actions.queryError([query, err]));
        }
    }
}

function addToMappedList<K, V>(map: Map<K, V[]>, key: K, value: V) {
    const list = map.get(key);
    if (list) {
        list.push(value);
    } else {
        map.set(key, [value]);
    }
}
function* updateObservationsByCode(action: PayloadAction<[string, FHIR.Resource[]]>) {
    if (!action.payload[0].startsWith("Observation")) {
        return;
    }

    const observations = yield* select((s: RootState) => s.fhir.resources.observations);
    const observationsByCode = new Map<string, FHIR.Observation[]>();
    for (const observation of Object.values(observations)) {
        for (const code of observation.code.coding ?? []) {
            const obKey = code.system + "|" + code.code;
            addToMappedList(observationsByCode, obKey, observation);
        }
    }
    yield put(actions.setObservationsByCode(observationsByCode));
}

function* onSave(action: PayloadAction<SaveState>) {
    if (action.payload.state !== "save-requested") {
        return;
    }
    yield put(actions.setSaveState({ state: "saving" }));

    // form a transaction bundle
    const state = yield* select((s: RootState) => s.fhir);
    const edits: FHIR.Resource[] = Object.values(state.edits).flatMap(Object.values);
    const entries = edits.map((resource) => ({
        fullUrl: resource.id,
        resource,
        request: {
            method: resource.id.startsWith("urn:uuid:") ? "POST" : "PUT",
            url: resource.id.startsWith("urn:uuid:") ? resource.resourceType : resource.resourceType + "/" + resource.id,
        },
    }));
    const bundle = FHIR.Bundle.newTransaction(entries);

    try {
        // send transaction to FHIR server
        const response: FHIR.Resource = yield* call(postFHIR, bundle);
        if (FHIR.isBundle(response)) {
            yield put(actions.setSaveState({ state: "saved" }));
        } else {
            console.error("transaction response is not a bundle", response);
        }
    } catch (error) {
        console.error("FHIR save error", error);
        yield put(actions.setSaveState({ state: "error", error }));
    }
}

export function* fhirSagas() {
    yield takeEvery(actions.query, onQuery);
    yield takeEvery(actions.queryLoaded, updateObservationsByCode);

    yield takeEvery(actions.setSaveState, onSave);

    yield fork(loadAllResources);
}

export function* loadAllResources() {
    const patientId = yield* select((s: RootState) => s.fhir.patientId);

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
        yield put(actions.query({ query: searchUrl(), showLoadingScreen: true }));
    }
}

export const useFHIR: Redux.TypedUseSelectorHook<{ fhir: State }> = Redux.useSelector;

/*
export function useFHIRQuery(query: string): QueryState {
    // request the query
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(actions.query(query));
    }, []);

    // load & watch query status
    const state = useFHIR((s) => s.fhir.queries[query]) ?? { state: "loading" };
    return state;
}
export function useFHIRQueries(queries: string[]): QueryState {
    const states = queries.map(useFHIRQuery);

    const errors = states.filter((s) => s.state === "error" && s.error);
    if (errors.length > 0) {
        return { state: "error", error: errors[0] };
    }

    const loading = states.some((s) => s.state === "loading");
    if (loading) {
        return { state: "loading" };
    }

    return { state: "loaded" };
}
*/

export const actions = fhirSlice.actions;
export const useDispatch = Redux.useDispatch;
