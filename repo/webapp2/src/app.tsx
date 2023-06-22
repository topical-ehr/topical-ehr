import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/dashboard";
import PatientPage from "./pages/patient";
import { store } from "./redux/store";
import { ErrorBoundary } from "./utils/ErrorBoundary";

export function App() {
    return (
        <ErrorBoundary>
            <Provider store={store}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/patient/:patientId" element={<PatientPage />} />
                    </Routes>
                </BrowserRouter>
            </Provider>
        </ErrorBoundary>
    );
}
