import * as FHIR from "@topical-ehr/fhir-types";
import { EHRConfig } from "@topical-ehr/fhir-store/config";
import {
    loadPatientResourcesSaga,
    unreadListSaga,
} from "@topical-ehr/fhir-store/patients";
import { EHRPageConfig } from "@topical-ehr/fhir-store/config-provider";
import { PatientHeader } from "@topical-ehr/patients/PatientHeader";
import { NewNote } from "@topical-ehr/save-changes-panel/NewNote";
import { MarkAsReadButton } from "@topical-ehr/timeline/MarkAsReadButton";
import { RecordObsPanel } from "@topical-ehr/timeline/panels/RecordObsPanel";
import { RecordMedsPanel } from "@topical-ehr/timeline/panels/RecordMedsPanel";
import { TimelineViewButtons } from "@topical-ehr/timeline/buttons/TimelineViewButtons";
import { TimelineRecordMenu } from "@topical-ehr/timeline/buttons/TimelineRecordMenu";
import { groupNotes } from "@topical-ehr/timeline/groupNotes";
import { groupMedications } from "@topical-ehr/timeline/groupMedications";
import { groupObservations } from "@topical-ehr/timeline/groupObservations";
import { Timeline, defaultRenderer } from "@topical-ehr/timeline/Timeline";
import { TopicsColumn } from "@topical-ehr/topics/TopicsColumn";
import { ConditionCodingAI } from "@topical-ehr/topics/edit/ConditionCodingAI";
import { TasksEdit } from "@topical-ehr/topics/edit/TasksEdit";
import { ConditionsEdit } from "@topical-ehr/topics/edit/ConditionEdit";
import { NewItem } from "@topical-ehr/topics/edit/NewItem";
import { NewTopicButton } from "@topical-ehr/topics/edit/NewTopicButton";
import { NewEncounterButton } from "@topical-ehr/topics/edit/NewEncounterButton";
import { AIButton } from "@topical-ehr/topics/edit/AIButton";
import { PrescriptionsEdit } from "@topical-ehr/topics/edit/PrescriptionsEdit";
import { SummaryEdit } from "@topical-ehr/topics/edit/SummaryEdit";
import { TitleEdit } from "@topical-ehr/topics/edit/TitleEdit";
import { StatusEdit } from "@topical-ehr/topics/edit/StatusEdit";
import { createTopicsForStandaloneResourcesSaga } from "@topical-ehr/topics/sagas/createTopicsForStandaloneConditions";
import { ChartsView } from "@topical-ehr/topics/view/ChartsView";
import { TasksView } from "@topical-ehr/topics/view/TaskView";
import { ConditionsView } from "@topical-ehr/topics/view/ConditionView";
import { DecisionSupportTiles } from "@topical-ehr/topics/view/DecisionSupportTiles";
import { PrescriptionsView } from "@topical-ehr/topics/view/PrescriptionView";
import { SummaryView } from "@topical-ehr/topics/view/SummaryView";
import { TitleView } from "@topical-ehr/topics/view/TitleView";
import { TopicHoverButtons } from "@topical-ehr/topics/view/TopicHoverButtons";
import { Column, ColumnLayout } from "@topical-ehr/ui-elements/layout/ColumnLayout";
import { ButtonRow } from "@topical-ehr/ui-elements/layout/ButtonRow";
import { FieldGrid } from "@topical-ehr/ui-elements/layout/FieldGrid";
import { useParams, useSearchParams } from "react-router-dom";
import { TopRightMenu } from "../components/TopRightMenu";

import css from "./PatientPage.module.scss";
import { SelectPractitionerDialog } from "@topical-ehr/practitioners/SelectPractitionerDialog";
import TopRightButtons from "../components/TopRightButtons";

export default function PatientPage() {
    const { patientId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    if (!patientId) {
        throw new Error(`PatientPage is missing patientId`);
    }

    const practitionerId = searchParams.get("practitioner");
    function onSelectedPractitioner(selected: FHIR.Practitioner | null) {
        if (selected) {
            setSearchParams((prev) => {
                prev.set("practitioner", selected.id);
                return prev;
            });
        }
    }
    if (!practitionerId) {
        const config: EHRConfig = {
            patientId,
            practitionerId: "",
            additionalSagas: [],
        };
        return (
            <div>
                <EHRPageConfig config={config}>
                    <SelectPractitionerDialog onClose={onSelectedPractitioner} />
                </EHRPageConfig>
            </div>
        );
    }

    const config: EHRConfig = {
        patientId,
        practitionerId,
        additionalSagas: [
            unreadListSaga,
            loadPatientResourcesSaga,
            createTopicsForStandaloneResourcesSaga,
        ],
    };

    return (
        <div className={css.patientPage}>
            <EHRPageConfig config={config}>
                <div className={css.patientPageHeader}>
                    <PatientHeader />
                    <TopRightButtons>
                        <AIButton />
                        <TopRightMenu />
                    </TopRightButtons>
                </div>

                <ColumnLayout>
                    <Column
                        width="40%"
                        marginLeft="1em"
                    >
                        <ButtonRow>
                            <TimelineRecordMenu />
                            <TimelineViewButtons />
                        </ButtonRow>

                        <RecordObsPanel />
                        <RecordMedsPanel />

                        <Timeline
                            groupers={[groupNotes, groupObservations, groupMedications]}
                            renderer={defaultRenderer}
                        />
                    </Column>

                    <Column width="30%">
                        <ButtonRow>
                            <NewEncounterButton />
                            <NewTopicButton />
                        </ButtonRow>

                        <TopicsColumn>
                            <TopicHoverButtons />

                            <TitleView />

                            <FieldGrid>
                                <TitleEdit />
                                <StatusEdit />
                            </FieldGrid>

                            <SummaryView />
                            <SummaryEdit />

                            <ConditionCodingAI apiUrl="https://ai-server-k6k6b76nja-ts.a.run.app/v1/coding" />

                            <TasksView />
                            <TasksEdit />

                            <ConditionsView />
                            <ConditionsEdit />
                            <PrescriptionsView />
                            <PrescriptionsEdit />

                            <NewItem />

                            <DecisionSupportTiles />
                            <ChartsView />
                        </TopicsColumn>
                    </Column>

                    <Column width="30%">
                        <div className={css.notesColumn}>
                            <ButtonRow>
                                <MarkAsReadButton />
                            </ButtonRow>

                            <Timeline
                                groupers={[groupNotes]}
                                showOverride={{ notes: true }}
                                renderer={defaultRenderer}
                                scrollToBottom
                                oldestFirst
                            />
                            <NewNote />
                        </div>
                    </Column>
                </ColumnLayout>
            </EHRPageConfig>
        </div>
    );
}
