import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { TopicsList } from "../components/topics/TopicsList";
import { Column, ColumnLayout } from "../components/layout/ColumnLayout";
import { Logo } from "../components/layout/Logo";
import { PatientHeader } from "../components/patient/PatientHeader";
import { DefaultButton, Stack } from "@fluentui/react";
import { EditsPanel } from "../components/editing/EditsPanel";
import { ObservationGroups2 } from "../components/observations/ObservationGroups2";
import { actions } from "../redux/FhirState";
import { DocumentTile } from "../components/documents/DocumentTile";

export default function PatientPage() {
    const { patientId } = useParams();
    if (!patientId) {
        throw new Error(`PatientPage is missing patientId`);
    }

    const dispatch = useDispatch();

    function onNewTopic() {
        const now = new Date().toISOString();
        const newComposition = FHIR.Composition.new({
            subject: { reference: `Patient/${state.patientId}` },
            status: "preliminary",
            type: { text: "topic" },
            date: now,
            title: "New topic",
            section: [{}],
        });
        dispatch(actions.edit(newComposition));
    }

    return (
        <div>
            <Logo />

            <PatientHeader />

            <ColumnLayout>
                <Column width="40%">
                    <DefaultButton
                        text="➕ New topic"
                        onClick={onNewTopic}
                    />

                    <TopicsList patientId={patientId} />
                </Column>

                <Column
                    width="40%"
                    marginLeft="1em"
                >
                    <Stack
                        horizontal
                        tokens={{ childrenGap: 10 }}
                    >
                        <DefaultButton
                            text="💓 Obs"
                            onClick={() => {}}
                        />
                        <DefaultButton
                            text="💊 Meds"
                            onClick={() => {}}
                        />
                    </Stack>

                    <DocumentTile
                        date="3 Sep 2019"
                        title="Letter from Cardiologist"
                    />
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
                <Column width="20%">
                    <EditsPanel />
                </Column>

                {/* <Column>
          <Tile title="🔥 FHIR">
            <FHIR.JSON path={`Patient/${patientId}/$everything`} />
          </Tile>
        </Column> */}

                <div key="item-4"></div>
            </ColumnLayout>
        </div>
    );
}
