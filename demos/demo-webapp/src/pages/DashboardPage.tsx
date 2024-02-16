import { EHRConfig } from "@topical-ehr/fhir-store/config";
import { EHRPageConfig } from "@topical-ehr/fhir-store/config-provider";
import { loadPatientsBoardSaga } from "@topical-ehr/fhir-store/patientBoard";
import { PatientsBoard } from "@topical-ehr/patients/PatientBoard";

export default function DashboardPage() {
    const config: EHRConfig = {
        patientId: "",
        practitionerId: "",
        additionalSagas: [loadPatientsBoardSaga],
    };
    return (
        <div>
            <EHRPageConfig config={config}>
                <PatientsBoard />
            </EHRPageConfig>
        </div>
    );
}
