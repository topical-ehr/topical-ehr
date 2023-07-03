import { ErrorBoundary } from "@topical-ehr/ui-elements/ErrorBoundary";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/dashboard";
import PatientPage from "./pages/PatientPage";

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
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}
