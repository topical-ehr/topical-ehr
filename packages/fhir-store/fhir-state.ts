import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Draft } from "immer";
import * as Redux from "react-redux";
import { fork, put, takeEvery } from "redux-saga/effects";
import { call, select } from "typed-redux-saga";

import * as FHIR from "@topical-ehr/fhir-types";
import { FhirResourceById } from "@topical-ehr/fhir-types";

import type { RootState } from "./store";
import { EHRConfig } from "./config";
import { FhirServerConfigData, FhirServerMethods, fhirUp } from "./fhir-server";

interface QueryRequest {
    query: string;
    showLoadingScreen: boolean;
}
type QueryState =
    | { state: "loading"; showLoadingScreen: boolean }
    | { state: "error"; error: unknown }
    | { state: "loaded" };

interface SaveRequest {
    // enables saving a subset of edited resources (e.g. just-added obs)
    filter?(editedResource: FHIR.Resource): boolean;
}

type SaveState = { state: "saving" } | { state: "error"; error: unknown } | { state: "saved" };

export interface FhirResources<T = never> {
    compositions: FhirResourceById<FHIR.Composition | T>;
    conditions: FhirResourceById<FHIR.Condition | T>;
    patients: FhirResourceById<FHIR.Patient | T>;
    observations: FhirResourceById<FHIR.Observation | T>;
    diagnosticReports: FhirResourceById<FHIR.DiagnosticReport | T>;
    medicationAdministrations: FhirResourceById<FHIR.MedicationAdministration | T>;
    medicationRequests: FhirResourceById<FHIR.MedicationRequest | T>;
    serviceRequests: FhirResourceById<FHIR.ServiceRequest | T>;
}
const emptyResources: FhirResources = {
    compositions: {},
    conditions: {},
    patients: {},
    observations: {},
    diagnosticReports: {},
    medicationAdministrations: {},
    medicationRequests: {},
    serviceRequests: {},
};

function getResourceContainer(resources: Draft<FhirResources>, resourceType: string) {
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
        case "MedicationAdministration":
            return resources.medicationAdministrations;
        case "MedicationRequest":
            return resources.medicationRequests;
        case "ServiceRequest":
            return resources.serviceRequests;
        default:
            throw new Error(`No state object for resource ${resourceType}`);
    }
}

function setResource(resources: Draft<FhirResources>, r: FHIR.Resource) {
    const container = getResourceContainer(resources, r.resourceType);
    // @ts-expect-error
    container[r.id] = r;
}

function getResource(resources: Draft<FhirResources>, r: FHIR.Resource): FHIR.Resource {
    const container = getResourceContainer(resources, r.resourceType);
    return container[r.id];
}

function deleteResource(resources: Draft<FhirResources>, r: FHIR.Resource) {
    const container = getResourceContainer(resources, r.resourceType);
    delete container[r.id];
}

export interface ByCode<T> {
    [code: string]: T[];
}

export interface State {
    // loaded state of FHIR queries
    queries: {
        [query: string]: QueryState;
    };

    // loaded resources, including edits
    resourcesWithEdits: FhirResources;

    // resources persisted at server (for undo)
    resourcesFromServer: FhirResources;

    // edits
    edits: FhirResources;
    deletions: FhirResourceById<FHIR.Resource>;

    // loaded resource by code (without edits)
    byCode: {
        observations: ByCode<FHIR.Observation>;
    };

    saveState: SaveState | null;
    saveGeneration: number;

    // config
    patientId: string;
    serverConfig: FhirServerConfigData;

    // misc
    showingPanels: Record<string, boolean>;
    searchingFor: string | null;
}

export function initialState(config: EHRConfig | null, serverConfig: FhirServerConfigData): State {
    return {
        queries: {},
        resourcesWithEdits: emptyResources,
        resourcesFromServer: emptyResources,
        edits: emptyResources,
        deletions: {},
        saveState: null,
        saveGeneration: 0,
        byCode: {
            observations: {},
        },

        // set by preloadedState
        patientId: config?.patientId ?? "",
        serverConfig,

        showingPanels: {},
        searchingFor: null,
    };
}

export const fhirSlice = createSlice({
    name: "FHIR",
    initialState: initialState(null, { server: { type: "http", baseUrl: "/fhir" } }),
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
                setResource(state.resourcesWithEdits, resource);
                setResource(state.resourcesFromServer, resource);
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

        edit(state, { payload: resource }: PayloadAction<FHIR.Resource>) {
            setResource(state.edits, resource);
            setResource(state.resourcesWithEdits, resource);
            state.saveState = null;
        },

        undoEdits(state, { payload: resource }: PayloadAction<FHIR.Resource>) {
            deleteResource(state.edits, resource);

            const original = getResource(state.resourcesFromServer, resource);
            setResource(state.resourcesWithEdits, original);
        },

        delete(state, { payload: resource }: PayloadAction<FHIR.Resource>) {
            state.deletions[FHIR.referenceTo(resource).reference] = resource;
            deleteResource(state.resourcesWithEdits, resource);
            deleteResource(state.edits, resource);
            state.saveState = null;
        },
        deleteImmediately(state, { payload: resource }: PayloadAction<FHIR.Resource>) {
            deleteResource(state.resourcesWithEdits, resource);
            deleteResource(state.edits, resource);
            state.saveState = null;
        },
        undoDelete(state, { payload: resource }: PayloadAction<FHIR.Resource>) {
            delete state.deletions[FHIR.referenceTo(resource).reference];

            const original = getResource(state.resourcesFromServer, resource);
            setResource(state.resourcesWithEdits, original);
        },

        save(state, action: PayloadAction<SaveRequest>) {
            state.saveState = { state: "saving" };
            // processed by a saga
        },

        setSaveState(state, action: PayloadAction<SaveState>) {
            state.saveState = action.payload;
        },

        setSaved(state, { payload: resources }: PayloadAction<FHIR.Resource[]>) {
            // commit edits
            for (const resource of resources) {
                setResource(state.resourcesFromServer, resource);
                deleteResource(state.edits, resource);
            }
            state.saveGeneration += 1;
        },

        deleted(state, { payload: resource }: PayloadAction<FHIR.Resource>) {
            // commit deletion
            deleteResource(state.resourcesFromServer, resource);
            state.saveGeneration += 1;
        },

        undoAll(state, action: PayloadAction<void>) {
            for (const key of Object.keys(state.edits)) {
                // @ts-ignore
                state.edits[key] = {};
            }
        },

        setObservationsByCode(state, action: PayloadAction<ByCode<FHIR.Observation>>) {
            state.byCode.observations = action.payload;
        },

        showPanel(state, { payload }: PayloadAction<string>) {
            state.showingPanels[payload] = true;
        },
        hidePanel(state, { payload }: PayloadAction<string>) {
            state.showingPanels[payload] = false;
        },
        setSearchingFor(state, { payload }: PayloadAction<string>) {
            state.searchingFor = payload || null;
        },
    },
});

function* onQuerySaga(fhirServer: FhirServerMethods, action: PayloadAction<QueryRequest>) {
    const { query } = action.payload;
    const state = yield* select((s: RootState) => s.fhir.queries[query]);
    if (!state) {
        yield put(actions.queryLoading(action.payload));

        try {
            // Call FHIR server
            const data: FHIR.Resource = yield* call(fhirServer.fetch, query);
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

function addToMappedList<T>(map: ByCode<T>, key: string, value: T) {
    const list = map[key];
    if (list) {
        list.push(value);
    } else {
        map[key] = [value];
    }
}
function* updateObservationsByCodeSaga(action: PayloadAction<[string, FHIR.Resource[]]>) {
    if (!action.payload[0].startsWith("Observation")) {
        return;
    }

    const observations = yield* select((s: RootState) => s.fhir.resourcesWithEdits.observations);
    const observationsByCode: ByCode<FHIR.Observation> = {};
    for (const observation of Object.values(observations)) {
        for (const code of observation.code.coding ?? []) {
            const obKey = code.system + "|" + code.code;
            addToMappedList(observationsByCode, obKey, observation);
        }
    }
    yield put(actions.setObservationsByCode(observationsByCode));
}

function* onSaveSaga(fhirServer: FhirServerMethods, action: PayloadAction<SaveRequest>) {
    yield put(actions.setSaveState({ state: "saving" }));

    function doFilter(resources: FHIR.Resource[]) {
        const { filter } = action.payload;
        if (filter) {
            return resources.filter(filter);
        } else {
            return resources;
        }
    }

    // form a transaction bundle
    const state = yield* select((s: RootState) => s.fhir);
    const toSave: FHIR.Resource[] = doFilter(Object.values(state.edits).flatMap(Object.values));
    const entries = toSave.map((resource) => ({
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
        const response: FHIR.Resource = yield* call(fhirServer.post, bundle);
        if (FHIR.isBundle(response)) {
            yield put(actions.setSaved(toSave));
        } else {
            console.error("transaction response is not a bundle", response);
        }
    } catch (error) {
        console.error("FHIR save error", error);
        yield put(actions.setSaveState({ state: "error", error }));
    }
}

function* onDeleteImmediately(fhirServer: FhirServerMethods, { payload: resource }: PayloadAction<FHIR.Resource>) {
    try {
        // send DELETE to FHIR server
        yield* call(fhirServer.delete, resource);
        yield put(actions.deleted(resource));
    } catch (error) {
        console.error("FHIR DELETE error", error);
    }
}

export function* coreFhirSagas() {
    const serverConfig = yield* select((s: RootState) => s.fhir.serverConfig);
    const fhirServer = yield* call(fhirUp, serverConfig);

    yield takeEvery(actions.query, onQuerySaga, fhirServer);
    yield takeEvery(actions.queryLoaded, updateObservationsByCodeSaga);

    yield takeEvery(actions.save, onSaveSaga, fhirServer);
    yield takeEvery(actions.deleteImmediately, onDeleteImmediately, fhirServer);

    yield fork(loadAllResourcesSaga);
}

export function* loadAllResourcesSaga() {
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
