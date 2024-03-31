import { EHRConfig } from "@topical-ehr/fhir-store/config";
import { EHRPageConfig } from "@topical-ehr/fhir-store/config-provider";
import { loadPatientsBoardSaga } from "@topical-ehr/fhir-store/patientBoard";
import { PatientsBoard } from "@topical-ehr/patients/dashboard/PatientsBoard";
import { MainMenu } from "@topical-ehr/patients/dashboard/menus/MainMenu";

import css from "./DashboardPage.module.scss";

export default function DashboardPage() {
    const config: EHRConfig = {
        patientId: "",
        practitionerId: "",
        additionalSagas: [loadPatientsBoardSaga],
    };
    return (
        <div className={css.container}>
            <EHRPageConfig config={config}>
                <h1>
                    Dashboard
                    <span style={{ marginLeft: "0.5em" }} />
                    <MainMenu />
                </h1>
                <PatientsBoard />
            </EHRPageConfig>
        </div>
    );
}
