import { DefaultButton, Stack } from "@fluentui/react";
import { EHRConfig } from "@topical-ehr/fhir-store/config";
import { EHRPageConfig } from "@topical-ehr/fhir-store/config-provider";
import { PatientHeader } from "@topical-ehr/patients/PatientHeader";
import { EditsPanel } from "@topical-ehr/save-changes-panel/EditsPanel";
import { groupObservations } from "@topical-ehr/timeline/groupObservations";
import { Timeline, defaultRenderer } from "@topical-ehr/timeline/Timeline";
import { TopicsColumn } from "@topical-ehr/topics/TopicsColumn";
import { ConditionsEdit } from "@topical-ehr/topics/edit/ConditionEdit";
import { NewItem } from "@topical-ehr/topics/edit/NewItem";
import { NewTopicButton } from "@topical-ehr/topics/edit/NewTopicButton";
import { PrescriptionsEdit } from "@topical-ehr/topics/edit/PrescriptionsEdit";
import { SummaryEdit } from "@topical-ehr/topics/edit/SummaryEdit";
import { TitleEdit } from "@topical-ehr/topics/edit/TitleEdit";
import { StatusEdit } from "@topical-ehr/topics/edit/StatusEdit";
import { createTopicsForStandaloneConditionsSaga } from "@topical-ehr/topics/sagas/createTopicsForStandaloneConditions";
import { ChartsView } from "@topical-ehr/topics/view/ChartsView";
import { ConditionsView } from "@topical-ehr/topics/view/ConditionView";
import { DecisionSupportTiles } from "@topical-ehr/topics/view/DecisionSupportTiles";
import { PrescriptionsView } from "@topical-ehr/topics/view/PrescriptionView";
import { SummaryView } from "@topical-ehr/topics/view/SummaryView";
import { TitleView } from "@topical-ehr/topics/view/TitleView";
import { TopicHoverButtons } from "@topical-ehr/topics/view/TopicHoverButtons";
import { Column, ColumnLayout } from "@topical-ehr/ui-elements/layout/ColumnLayout";
import { FieldGrid } from "@topical-ehr/ui-elements/layout/FieldGrid";
import { Logo } from "@topical-ehr/ui-elements/layout/Logo";
import { useParams } from "react-router-dom";

export default function PatientPage() {
    const { patientId } = useParams();
    if (!patientId) {
        throw new Error(`PatientPage is missing patientId`);
    }

    const config: EHRConfig = {
        patientId,
        additionalSagas: [createTopicsForStandaloneConditionsSaga],
    };

    return (
        <div>
            <EHRPageConfig config={config}>
                <Logo />

                <PatientHeader />

                <ColumnLayout>
                    <Column width="40%">
                        <NewTopicButton />

                        <TopicsColumn>
                            <TopicHoverButtons />

                            <TitleView />

                            <FieldGrid>
                                <TitleEdit />
                                <StatusEdit />
                            </FieldGrid>

                            <SummaryView />
                            <SummaryEdit />

                            <ConditionsView />
                            <ConditionsEdit />
                            <PrescriptionsView />
                            <PrescriptionsEdit />

                            <NewItem />

                            <DecisionSupportTiles />
                            <ChartsView />
                        </TopicsColumn>
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

                        <Timeline
                            groupers={[groupObservations]}
                            renderer={defaultRenderer}
                        ></Timeline>
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
            </EHRPageConfig>
        </div>
    );
}
