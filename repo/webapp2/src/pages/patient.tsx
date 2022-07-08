import { useParams } from "react-router-dom";
import { TopicsList } from "../components/topics/TopicsList";
import { Column, ColumnLayout } from "../components/layout/ColumnLayout";
import { Logo } from "../components/layout/Logo";
import { Tile } from "../components/layout/Tile";
import { ObservationGroups } from "../components/observations/ObservationGroups";
import { ObservationList } from "../components/observations/ObservationList";
import { PatientHeader } from "../components/patient/PatientHeader";
import { DefaultButton, Stack } from "@fluentui/react";
import { EditsPanel } from "../components/editing/EditsPanel";
import { ObservationGroups2 } from "../components/observations/ObservationGroups2";

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
        <Column width="33%">
          <DefaultButton text="➕ New topic" onClick={() => {}} />

          <TopicsList patientId={patientId} />
        </Column>

        <Column width="33%">
          <Stack
            style={{ marginLeft: "1em" }}
            horizontal
            tokens={{ childrenGap: 10 }}
          >
            <DefaultButton text="💓 Add obs" onClick={() => {}} />
            <DefaultButton text="💊 Record medication" onClick={() => {}} />
          </Stack>

          <ObservationGroups2 patientId={patientId} />
          {/* <Tile title="">
          </Tile>
          <Tile title="">
            <ObservationGroups patientId={patientId} />
          </Tile>
          <Tile title="All results">
            <ObservationList.All
              fhirQuery={`Observation?subject=Patient/${patientId}`}
            />
          </Tile> */}
        </Column>
        <Column width="33%">
          <EditsPanel />
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
