import * as R from "remeda";
import { useFHIR } from "@topical-ehr/fhir-store";
import { Topic, activeStatus, loadTopics } from "./Topic";
import { TopicEdit } from "./TopicEdit";
import { TopicDisplay } from "./TopicDisplay";

interface Props {}

export function TopicsColumns(props: Props) {
    const compositions = useFHIR((s) => s.fhir.resources.compositions);
    const conditions = useFHIR((s) => s.fhir.resources.conditions);
    const medicationRequests = useFHIR((s) => s.fhir.resources.medicationRequests);

    const topics = loadTopics(conditions, compositions, medicationRequests);

    const [active, inactive] = R.partition(topics, (t) => activeStatus(t) === "active");

    return (
        <div style={{ marginTop: "1em" }}>
            <TopicGroup
                title=""
                initiallyCollapsed={false}
                topics={active}
            />
            <TopicGroup
                title="Inactive"
                initiallyCollapsed
                topics={inactive}
            />
        </div>
    );
}

interface TopicGroupProps {
    title: string;
    initiallyCollapsed: boolean;
    topics: Topic[];
}
function TopicGroup(props: TopicGroupProps) {
    const [collapsed, setCollapsed] = React.useState(props.initiallyCollapsed);
    const chevron = collapsed ? "►" : "▼";

    function onTitleClicked() {
        setCollapsed(!collapsed);
    }

    return (
        <div>
            {props.title && (
                <h3
                    style={{ cursor: "pointer" }}
                    title="Topic group"
                    onClick={onTitleClicked}
                >
                    {chevron + " " + props.title}
                </h3>
            )}
            {!collapsed && (
                <div>
                    {props.topics.map((t) => (
                        <TopicViewOrEdit topic={t} />
                    ))}
                </div>
            )}
        </div>
    );
}

function TopicViewOrEdit({ topic }: { topic: Topic }) {
    const compositionEdits = useFHIR((s) => s.fhir.edits.compositions);
    const editing = !!compositionEdits[topic.composition.id];

    if (editing) {
        return <TopicEdit topic={topic} />;
    } else {
        return <TopicDisplay topic={topic} />;
    }
}
