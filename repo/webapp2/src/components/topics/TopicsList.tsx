import { useFHIR, useFHIRQueries } from "../../redux/FhirState";
import { groupTopics } from "../../utils/TopicGroup";
import { ErrorMessage } from "../feedback/ErrorMessage";
import { Loading } from "../feedback/Loading";
import { TopicGroupDisplay } from "./TopicGroup";

interface Props {
    patientId: string;
}

export function TopicsList(props: Props) {
    const query = useFHIRQueries([
        `Condition?subject=Patient/${props.patientId}`,
        `Composition?subject=Patient/${props.patientId}`,
        `MedicationRequest?subject=Patient/${props.patientId}`,
    ]);
    const compositions = useFHIR((s) => s.fhir.resources.compositions);
    const conditions = useFHIR((s) => s.fhir.resources.conditions);
    const medicationRequests = useFHIR((s) => s.fhir.resources.medicationRequests);

    if (query.state === "error") {
        debugger;
        return <ErrorMessage error={query.error} />;
    }
    if (query.state === "loading") {
        return <Loading />;
    }

    const topicGroups = groupTopics(conditions, compositions, medicationRequests);

    return (
        <div style={{ marginTop: "1em" }}>
            {topicGroups.map((tg) => (
                <TopicGroupDisplay topicGroup={tg} key={tg.id} />
            ))}
        </div>
    );
}
