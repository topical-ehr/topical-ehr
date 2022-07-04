import { useFHIR, useFHIRQueries } from "../../redux/FhirState";
import { groupTopics, Topic } from "../../utils/topics";
import { ErrorMessage } from "../feedback/ErrorMessage";
import { Loading } from "../feedback/Loading";
import { TopicDisplay } from "./TopicDisplay";
import { TopicEdit } from "./TopicEdit";

interface Props {
    patientId: string;
}

export function TopicsList(props: Props) {
    const query = useFHIRQueries([
        `Condition?subject=Patient/${props.patientId}`,
        `Composition?subject=Patient/${props.patientId}`,
    ]);
    const compositions = useFHIR((s) => s.fhir.resources.compositions);
    const conditions = useFHIR((s) => s.fhir.resources.conditions);
    const editingTopics = useFHIR((s) => s.fhir.editingTopics);
    const autoAddedCompositions = useFHIR((s) => s.fhir.autoAddedCompositions);

    if (query.state === "error") {
        debugger;
        return <ErrorMessage error={query.error} />;
    }
    if (query.state === "loading") {
        return <Loading />;
    }

    const topicGroups = groupTopics(conditions, compositions);

    function renderTopic(t: Topic) {
        if (autoAddedCompositions[t.id]) {
            return null;
        }

        const Component = editingTopics[t.id] ? TopicEdit : TopicDisplay;
        return <Component key={t.id} topic={t} />;
    }

    return (
        <div style={{ marginTop: "1em" }}>
            {topicGroups.map((tg) => {
                return (
                    <div key={tg.id}>
                        {tg.title && <h3 title="Topic group">{tg.title}</h3>}
                        <div>{tg.topics.map((t) => renderTopic(t))}</div>
                    </div>
                );
            })}
        </div>
    );
}
