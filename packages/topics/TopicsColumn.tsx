import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import * as R from "remeda";
import { Topic, activeStatus, loadTopics } from "./Topic";
import { TopicContext } from "./TopicContext";

import css from "./TopicsColumn.module.scss";
import { ConditionsEdit } from "./edit/ConditionEdit";
import { NewItem } from "./edit/NewItem";
import { PrescriptionsEdit } from "./edit/PrescriptionsEdit";
import { SummaryEdit } from "./edit/SummaryEdit";
import { TitleEdit } from "./edit/TitleEdit";
import { ChartsView } from "./view/ChartsView";
import { ConditionsView } from "./view/ConditionView";
import { DecisionSupportTiles } from "./view/DecisionSupportTiles";
import { PrescriptionsView } from "./view/PrescriptionView";
import { SummaryView } from "./view/SummaryView";
import { TitleView } from "./view/TitleView";
import { TopicHoverButtons } from "./view/TopicHoverButtons";

interface Props {
    children: React.ReactNode[];
}

export function TopicsColumn(props: Props) {
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
            >
                {props.children}
            </TopicGroup>
            <TopicGroup
                title="Inactive"
                initiallyCollapsed
                topics={inactive}
            >
                {props.children}
            </TopicGroup>
        </div>
    );
}

TopicsColumn.Defaults = function () {
    return (
        <TopicsColumn>
            <TopicHoverButtons />

            <TitleView />
            <TitleEdit />

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
    );
};

interface TopicGroupProps {
    title: string;
    initiallyCollapsed: boolean;
    topics: Topic[];
    children: React.ReactNode[];
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
                        <TopicViewOrEdit topic={t}>{props.children}</TopicViewOrEdit>
                    ))}
                </div>
            )}
        </div>
    );
}

function TopicViewOrEdit(props: { topic: Topic; children: React.ReactNode[] }) {
    const topic = props.topic;

    const dispatch = useAppDispatch();

    const compositionEdits = useFHIR((s) => s.fhir.edits.compositions);
    const editing = !!compositionEdits[topic.composition.id];

    function onClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.ctrlKey) {
            alert(JSON.stringify(props.topic, null, 2));
        }
    }

    function onDoubleClick() {
        if (!editing) {
            dispatch(actions.edit(props.topic.composition));
        }
    }

    return (
        <TopicContext.Provider value={{ editing, topic }}>
            <div
                className={css.topic}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
            >
                {props.children}
            </div>
        </TopicContext.Provider>
    );
}
