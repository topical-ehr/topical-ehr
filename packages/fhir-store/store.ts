import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import createSagaMiddleware from "redux-saga";
import { fork } from "redux-saga/effects";

import { coreFhirSagas, fhirSlice, initialState } from "./fhir-state";
import { EHRConfig } from "./config";

export function createStore(config: EHRConfig) {
    const sagaMiddleware = createSagaMiddleware();

    const store = configureStore({
        reducer: {
            fhir: fhirSlice.reducer,
        },
        preloadedState: {
            fhir: initialState(config),
        },
        middleware: (getDefaultMiddleware) => [
            ...getDefaultMiddleware({
                thunk: false,
            }),
            sagaMiddleware,
        ],
    });

    function* rootSaga() {
        yield fork(coreFhirSagas);

        for (const saga of config.additionalSagas) {
            yield fork(saga);
        }
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
export const useAppDispatch = () => useDispatch<AppDispatch>();
