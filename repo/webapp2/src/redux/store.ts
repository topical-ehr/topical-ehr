import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import createSagaMiddleware from "redux-saga";
import { fork } from "redux-saga/effects";
import { fhirSagas, fhirSlice } from "./FhirState";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    fhir: fhirSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({
      thunk: false,
    }),
    sagaMiddleware,
  ],
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

function* rootSaga() {
  yield fork(fhirSagas);
}
const rootSagaTask = sagaMiddleware.run(rootSaga);
rootSagaTask.toPromise().catch((err) => {
  console.error("rootSaga failed", err);
  const str = err.toString();
  const msg = str.includes("Error") ? str : "Error: " + str;
  alert(msg);
});
