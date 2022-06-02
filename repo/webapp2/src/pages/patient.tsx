import { useParams } from "react-router-dom";
import { ConditionList } from "../components/conditions/ConditionList";
import { Column, ColumnLayout } from "../components/layout/ColumnLayout";
import { Logo } from "../components/layout/Logo";
import { Tile } from "../components/layout/Tile";
import { ObservationGroups } from "../components/observations/ObservationGroups";
import { ObservationList } from "../components/observations/ObservationList";
import { PatientHeader } from "../components/patient/PatientHeader";

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
        <Column width="50%">
          <ConditionList patientId={patientId} />
        </Column>

        <Column width="60%">
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
