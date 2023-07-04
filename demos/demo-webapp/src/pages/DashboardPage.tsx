import { ResizableGridLayout } from "@topical-ehr/ui-elements/layout/ResizableGridLayout";
import { Tile } from "@topical-ehr/ui-elements/layout/Tile";
import { PatientList } from "@topical-ehr/patients/PatientList";
import { Logo } from "@topical-ehr/ui-elements/layout/Logo";
import { EHRConfig } from "@topical-ehr/fhir-store/config";
import { EHRPageConfig } from "@topical-ehr/fhir-store/config-provider";

export default function DashboardPage() {
    const config: EHRConfig = {
        patientId: "",
        additionalSagas: [],
    };
    return (
        <div>
            <EHRPageConfig config={config}>
                <Logo />

                <ResizableGridLayout
                    layout={[
                        { i: "item-1", x: 0, y: 0, w: 4, h: 2 },
                        { i: "item-2", x: 4, y: 0, w: 4, h: 2 },
                        { i: "item-3", x: 0, y: 4, w: 4, h: 2 },
                        { i: "item-4", x: 4, y: 4, w: 4, h: 2 },
                    ]}
                >
                    <div key="item-1">
                        <Tile title="Recent">
                            <PatientList.Recent />
                        </Tile>
                    </div>

                    <div key="item-2">
                        <Tile title="All">
                            <PatientList.All />
                        </Tile>
                    </div>
                </ResizableGridLayout>
            </EHRPageConfig>
        </div>
    );
}
