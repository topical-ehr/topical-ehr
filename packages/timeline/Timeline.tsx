import React from "react";
import { DateTime } from "luxon";

import { FhirResources, State, useFHIR } from "@topical-ehr/fhir-store";
import { createSearcher } from "@topical-ehr/fhir-store/search";
import { ObservationDisplay } from "@topical-ehr/observations/ObservationDisplay";

import { TimelineItem } from "./TimelineItem";
import { DocumentView } from "./documents/DocumentView";
import { MedicationTimelineView } from "./medications/MedicationTimelineView";

import css from "./Timeline.module.scss";

export type Grouper = (resources: FhirResources) => TimelineItem[];
export type Renderer = (item: TimelineItem, byCode: State["byCode"]) => React.ReactNode;

interface Props {
    groupers: Grouper[];
    renderer: Renderer;
}

export function defaultRenderer(item: TimelineItem, byCode: State["byCode"]) {
    const time = item.dateTime.toLocaleString(DateTime.TIME_SIMPLE);

    switch (item.item.type) {
        case "observation-group":
            return (
                <div>
                    <div title={item.item.titleFull}>
                        {time}
                        <span className={css.group_title}>{item.item.title}</span>
                    </div>
                    <ObservationDisplay
                        observations={item.item.observations}
                        observationsByCode={byCode.observations}
                    />
                </div>
            );

        case "observation":
            return (
                <>
                    {time}
                    <ObservationDisplay
                        observations={[item.item.observation]}
                        observationsByCode={byCode.observations}
                    />
                </>
            );

        case "progress-note":
            return (
                <DocumentView
                    document={item.item.document}
                    time={time}
                />
            );

        case "medication-administration":
            return (
                <MedicationTimelineView
                    meds={item.item.meds}
                    time={time}
                />
            );
    }
}

export function Timeline(props: Props) {
    const { groupers, renderer } = props;

    const resources = useFHIR((s) => s.fhir.resourcesFromServer);
    const byCode = useFHIR((s) => s.fhir.byCode);
    const searchingFor = useFHIR((s) => s.fhir.searchingFor);

    const items = React.useMemo(() => {
        // const filteredResources = searchingFor ? searchResources(resources, searchingFor) : resources;

        const items = groupers.flatMap((g) => g(resources));

        // newest first
        items.sort((a, b) => b.dateTimeString.localeCompare(a.dateTimeString));

        return items;
    }, [groupers, resources]);

    const dateGroups = React.useMemo(() => {
        // apply search filter
        const filteredItems = searchingFor ? items.filter(createSearcher(searchingFor)) : items;

        // group by date
        // use Map as it preserves the insertion order
        var map = new Map<string, TimelineItem[]>();

        for (const item of filteredItems) {
            const dateTime = item.dateTime;
            const date = `${dateTime.year}${dateTime.month.toString().padStart(2, "0")}${dateTime.day
                .toString()
                .padStart(2, "0")}`;
            const array = map.get(date);
            if (array) {
                array.push(item);
            } else {
                map.set(date, [item]);
            }
        }

        return map;
    }, [items, searchingFor]);

    function onDateRowClicked(event: React.MouseEvent) {
        const target = event.target as HTMLDivElement;
        target.nextElementSibling?.scrollTo(0, 0);
    }

    return (
        <div>
            {[...dateGroups.entries()].map(([date, items]) => (
                <div>
                    <div
                        className={css.dateRow}
                        id={date}
                        onClick={onDateRowClicked}
                    >
                        {items[0].dateTime.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                    </div>
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={css.item}
                        >
                            {renderer(item, byCode)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
