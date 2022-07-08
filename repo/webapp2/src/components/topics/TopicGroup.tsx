import React from "react";
import { useFHIR } from "../../redux/FhirState";
import { Topic, TopicGroup } from "../../utils/TopicGroup";
import { TopicDisplay } from "./TopicDisplay";
import { TopicEdit } from "./TopicEdit";

interface Props {
    topicGroup: TopicGroup;
}

export function TopicGroupDisplay(props: Props) {
    const editingTopics = useFHIR((s) => s.fhir.editingTopics);
    const autoAddedCompositions = useFHIR((s) => s.fhir.autoAddedCompositions);

    const initiallyCollapsed = props.topicGroup.collapsedByDefault;
    const [collapsed, setCollapsed] = React.useState(initiallyCollapsed);
    const chevron = collapsed ? "►" : "▼";

    function onTitleClicked() {
        setCollapsed(!collapsed);
    }

    function renderTopic(t: Topic) {
        if (autoAddedCompositions[t.id]) {
            return null;
        }

        const Component = editingTopics[t.id] ? TopicEdit : TopicDisplay;
        return <Component key={t.id} topic={t} />;
    }

    const tg = props.topicGroup;
    return (
        <div key={tg.id}>
            {tg.title && (
                <h3 style={{ cursor: "pointer" }} title="Topic group" onClick={onTitleClicked}>
                    {chevron + " " + tg.title}
                </h3>
            )}
            {!collapsed && <div>{tg.topics.map((t) => renderTopic(t))}</div>}
        </div>
    );
}
