import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as FHIR from "../utils/FhirTypes";
import { put, takeEvery, fork, all } from "redux-saga/effects";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { select, call } from "typed-redux-saga";
import { fetchFHIR } from "../utils/fetcher";
import React from "react";
import type { RootState } from "./store";

interface FhirQueryState {
  [query: string]:
    | {
        state: "loading";
      }
    | { state: "error"; error: unknown }
    | { state: "loaded" };
}

interface FhirResourceById<R> {
  [id: string]: R;
}

type Modification =
  | {
      type: "added";
    }
  | {
      type: "deleted";
      original: FHIR.Resource;
    }
  | {
      type: "updated";
      original: FHIR.Resource;
    };

export interface State {
  queries: FhirQueryState;
  resources: {
    patients: FhirResourceById<FHIR.Patient>;
    observations: FhirResourceById<FHIR.Observation>;
    diagnosticReports: FhirResourceById<FHIR.DiagnosticReport>;
  };
  modifications: {
    [id: string]: Modification;
  };
}
function getObjectForResource(state: State, r: FHIR.Resource) {
  const { resources } = state;
  switch (r.resourceType) {
    case "Patient":
      return resources.patients;
    case "Observation":
      return resources.observations;
    case "DiagnosticReport":
      return resources.diagnosticReports;
    default:
      throw new Error(`No state object for resource ${r.resourceType}`);
  }
}

const initialState: State = {
  queries: {},
  resources: {
    patients: {},
    observations: {},
    diagnosticReports: {},
  },
  modifications: {},
};

export const fhirSlice = createSlice({
  name: "FHIR",
  initialState: initialState,
  reducers: {
    query(state, action: PayloadAction<string>) {
      // handled by the saga
    },
    queryLoading(state, action: PayloadAction<string>) {
      const query = action.payload;
      state.queries[query] = { state: "loading" };
    },
    queryLoaded(state, action: PayloadAction<[string, FHIR.Resource[]]>) {
      const [query, resources] = action.payload;
      for (const resource of resources) {
        // @ts-ignore
        getObjectForResource(state, resource)[resource.id] = resource;
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
  },
});

function* onQuery(action: PayloadAction<string>) {
  const query = action.payload;
  const state = yield* select((s: RootState) => s.fhir.queries[query]);
  if (!state) {
    yield put(actions.queryLoading(query));

    try {
      // Call FHIR server
      const data: FHIR.Resource = yield* call(fetchFHIR, query);
      if (FHIR.isBundle(data)) {
        yield put(
          actions.queryLoaded([query, data.entry?.map((e) => e.resource) || []])
        );
      } else {
        yield put(actions.queryLoaded([query, [data]]));
      }
    } catch (err) {
      console.error("FHIR error", query, err);
      yield put(actions.queryError([query, err]));
    }
  }
}

export function* fhirSagas() {
  yield takeEvery(actions.query, onQuery);
}

export const useFHIR: TypedUseSelectorHook<{ fhir: State }> = useSelector;

export function useFHIRQuery(query: string) {
  // request the query
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(actions.query(query));
  }, []);

  // load & watch query status
  const state = useFHIR((s) => s.fhir.queries[query]) ?? { state: "loading" };
  return state;
}

export const actions = fhirSlice.actions;
