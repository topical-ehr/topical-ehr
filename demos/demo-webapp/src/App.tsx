import { ErrorBoundary } from "@topical-ehr/ui-elements/ErrorBoundary";
import { FhirServerConfigContext } from "@topical-ehr/fhir-store/fhir-server";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import PatientPage from "./pages/PatientPage";
import { FhirEditorPage } from "./pages/FhirEditorPage";
import { AutocompleteConfig } from "@topical-ehr/ui-autocomplete/AutocompleteConfig";
import { searchTerminology } from "@topical-ehr/terminology/FhirTerminology";
import { PromptEditor } from "@topical-ehr/fhir-editor/PromptEditor";

export function App() {
    return (
        <ErrorBoundary>
            <AutocompleteConfig
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
                            <Route
                                path="/edit-prompt"
                                element={<PromptEditor apiUrl="https://ai-server-k6k6b76nja-ts.a.run.app/v1/coding" />}
                            />
                        </Routes>
                    </BrowserRouter>
                </FhirServerConfigContext.Provider>
            </AutocompleteConfig>
        </ErrorBoundary>
    );
}
