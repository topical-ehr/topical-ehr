import React from "react";
import * as R from "remeda";

import * as FHIR from "@topical-ehr/fhir-types";
import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { createSearcher } from "@topical-ehr/fhir-store/search";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import { Topic, isActive, loadTopics } from "./Topic";
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
    const compositions = useFHIR((s) => s.fhir.resourcesWithEdits.compositions);
    const encounters = useFHIR((s) => s.fhir.resourcesWithEdits.encounters);
    const conditions = useFHIR((s) => s.fhir.resourcesWithEdits.conditions);
    const medicationRequests = useFHIR(
        (s) => s.fhir.resourcesWithEdits.medicationRequests
    );
    const tasks = useFHIR((s) => s.fhir.resourcesWithEdits.tasks);
    const searchingFor = useFHIR((s) => s.fhir.searchingFor);

    // TODO: don't filter out topics as they're being edited
    const searcher = createSearcher(searchingFor);
    const topics = loadTopics(
        compositions,
        encounters,
        conditions,
        medicationRequests,
        tasks
    ).filter(searcher);

    const [topicsWithEncounter, otherTopics] = R.partition(topics, (t) => !!t.encounter);
    const [addedEncounters, existingEncounters] = R.partition(topicsWithEncounter, (t) =>
        FHIR.isNew(t.encounter!)
    );
    const [activeEncounters, inactiveEncounters] = R.partition(
        existingEncounters,
        isActive
    );

    const [added, existing] = R.partition(otherTopics, (t) => FHIR.isNew(t.composition));
    const [active, inactive] = R.partition(existing, isActive);

    return (
        <div>
            <TopicGroup topics={addedEncounters}>{props.children}</TopicGroup>
            <TopicGroup topics={activeEncounters}>{props.children}</TopicGroup>
            <TopicGroup
                title="Past encounters"
                initiallyCollapsed
                topics={inactiveEncounters}
            >
                {props.children}
            </TopicGroup>

            <TopicGroup topics={added}>{props.children}</TopicGroup>
            <TopicGroup topics={active}>{props.children}</TopicGroup>
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
    title?: string;
    initiallyCollapsed?: boolean;
    topics: Topic[];
    children: React.ReactNode[];
}
function TopicGroup(props: TopicGroupProps) {
    const [collapsed, setCollapsed] = React.useState(props.initiallyCollapsed);
    const chevron = collapsed ? "►" : "▼";

    function onTitleClicked() {
        setCollapsed(!collapsed);
    }

    if (props.topics.length === 0) {
        return null;
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
                        <TopicViewOrEdit
                            key={t.id}
                            topic={t}
                        >
                            {props.children}
                        </TopicViewOrEdit>
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
                className={`${css.topic} ${editing ? "" : css.enable_hover_buttons}`}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
            >
                {props.children}
            </div>
        </TopicContext.Provider>
    );
}
