import { ErrorBoundary } from "@topical-ehr/ui-elements/ErrorBoundary";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import PatientPage from "./pages/PatientPage";
import { FhirEditorPage } from "./pages/FhirEditorPage";

export function App() {
    return (
        <ErrorBoundary>
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
                        path="/edit"
                        element={<FhirEditorPage />}
                    />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}
