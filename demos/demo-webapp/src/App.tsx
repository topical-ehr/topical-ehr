import { ErrorBoundary } from "@topical-ehr/ui-elements/ErrorBoundary";
import { FhirServerConfigContext } from "@topical-ehr/fhir-store/fhir-server";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import PatientPage from "./pages/PatientPage";
import { FhirEditorPage } from "./pages/FhirEditorPage";

export function App() {
    return (
        <ErrorBoundary>
            <FhirServerConfigContext.Provider
                value={{
                    server: {
                        type: "candlelite",
                        filename: "candlelite.sqlite",
                        initialSnapshotUrl: "/db_snapshots/CandleLite.sqlite.db",
                    },
                }}
            >
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/"
                            element={<DashboardPage />}
                        />
                        <Route
                            path="/patient/:patientId"
                            element={<PatientPage />}
                        />
                        <Route
                            path="/edit-fhir"
                            element={<FhirEditorPage />}
                        />
                    </Routes>
                </BrowserRouter>
            </FhirServerConfigContext.Provider>
        </ErrorBoundary>
    );
}
