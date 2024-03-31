import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import createSagaMiddleware from "redux-saga";
import { call, fork, join } from "redux-saga/effects";

import { coreFhirSagas, fhirSlice, initialState } from "./fhir-state";
import { EHRConfig } from "./config";
import { FhirServerConfigData } from "./fhir-server";
import { practitionersApi } from "./practitioner-slice";
import { patientsApi } from "./patient-slice";

export function createStore(config: EHRConfig, serverConfig: FhirServerConfigData) {
    const sagaMiddleware = createSagaMiddleware({});

    const store = configureStore({
        reducer: {
            fhir: fhirSlice.reducer,
            [patientsApi.reducerPath]: patientsApi.reducer,
            [practitionersApi.reducerPath]: practitionersApi.reducer,
        },
        preloadedState: {
            fhir: initialState(config, serverConfig),
        },
        middleware: (getDefaultMiddleware) => [
            ...getDefaultMiddleware({}),
            patientsApi.middleware,
            practitionersApi.middleware,
            sagaMiddleware,
        ],
    });

    function* rootSaga() {
        yield fork(coreFhirSagas, config.additionalSagas);
    }
    const rootSagaTask = sagaMiddleware.run(rootSaga);
    rootSagaTask.toPromise().catch((err) => {
        console.error("saga failed", err);
        const str = err.toString();
        const msg = str.includes("Error") ? str : "Error: " + str;
        alert(msg);
    });

    return store;
}

type StoreType = ReturnType<typeof createStore>;
export type RootState = ReturnType<StoreType["getState"]>;
export type AppDispatch = StoreType["dispatch"];
export type { AnyAction } from "@reduxjs/toolkit";
export const useAppDispatch = () => useDispatch<AppDispatch>();
