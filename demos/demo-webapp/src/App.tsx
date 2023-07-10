import { ErrorBoundary } from "@topical-ehr/ui-elements/ErrorBoundary";
import { FhirServerConfigContext } from "@topical-ehr/fhir-store/fhir-server";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import PatientPage from "./pages/PatientPage";
import { FhirEditorPage } from "./pages/FhirEditorPage";
import { TopicsConfig } from "@topical-ehr/topics/TopicsConfig";
import { searchTerminology } from "@topical-ehr/terminology/FhirTerminology";

export function App() {
    return (
        <ErrorBoundary>
            <TopicsConfig
                config={{
                    minInputLengthForSearch: 2,
                    searchTerminology(input, searchScope) {
                        const serverBaseUrl = "https://r4.ontoserver.csiro.au/fhir/";
                        return searchTerminology(serverBaseUrl, input, searchScope);
                    },
                }}
            >
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
            </TopicsConfig>
        </ErrorBoundary>
    );
}
