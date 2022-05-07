import { ResizableGridLayout } from "../components/layout/ResizableGridLayout";
import { Tile } from "../components/layout/Tile";
import { PatientList } from "../components/patients/PatientList";
import { FHIR } from "../components/dev/FHIR";
import { PatientHeader } from "../components/patient/PatientHeader";
import { Logo } from "../components/layout/Logo";
import { ObservationList } from "../components/observations/ObservationList";
import { ObservationGroups } from "../components/observations/ObservationGroups";

import { Column, ColumnLayout } from "../components/layout/ColumnLayout";
import { useParams } from "react-router-dom";

export default function PatientPage() {
  const { patientId } = useParams();
  if (!patientId) {
    throw new Error(`PatientPage is missing patientId`);
  }

  return (
    <div>
      <Logo />

      <PatientHeader />

      <ColumnLayout>
        <Column>Column 1</Column>

        <Column>
          <Tile title="">
            <ObservationGroups patientId={patientId} />
          </Tile>
          <Tile title="All results">
            <ObservationList.All
              fhirQuery={`Observation?subject=Patient/${patientId}`}
            />
          </Tile>
        </Column>

        {/* <Column>
          <Tile title="🔥 FHIR">
            <FHIR.JSON path={`Patient/${patientId}/$everything?_count=1000`} />
          </Tile>
        </Column> */}

        <div key="item-4"></div>
      </ColumnLayout>
    </div>
  );
}
