import React from "react";
import { DateTime } from "luxon";

import { FhirResources, State, useFHIR } from "@topical-ehr/fhir-store";
import { TimelineItem } from "./TimelineItem";

import css from "./Timeline.module.scss";
import { ObservationDisplay } from "@topical-ehr/observations/ObservationDisplay";
import { DocumentView } from "./documents/DocumentView";
import { MedicationTimelineView } from "./medications/MedicationTimelineView";
import { createSearcher } from "@topical-ehr/fhir-store/search";

export type Grouper = (resources: FhirResources) => TimelineItem[];
export type Renderer = (item: TimelineItem, byCode: State["byCode"]) => React.ReactNode;

interface Props {
    groupers: Grouper[];
    renderer: Renderer;
}

export function defaultRenderer(item: TimelineItem, byCode: State["byCode"]) {
    switch (item.item.type) {
        case "observation-group":
            return (
                <div>
                    <div
                        className={css.group_title}
                        title={item.item.titleFull}
                    >
                        {item.item.title}
                    </div>
                    <ObservationDisplay
                        observations={item.item.observations}
                        observationsByCode={byCode.observations}
                    />
                </div>
            );

        case "observation":
            return (
                <ObservationDisplay
                    observations={[item.item.observation]}
                    observationsByCode={byCode.observations}
                />
            );

        case "progress-note":
            return <DocumentView document={item.item.document} />;

        case "medication-administration":
            return <MedicationTimelineView meds={item.item.meds} />;
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
        items.sort((a, b) => b.dateTime.localeCompare(a.dateTime));
        return items;
    }, [groupers, resources]);

    function renderDateTime(dateTime: string) {
        const luxonDate = DateTime.fromISO(dateTime);
        // luxonDate.toRelativeCalendar();
        return luxonDate.toLocaleString(DateTime.DATETIME_MED);
    }

    const filteredItems = searchingFor ? items.filter(createSearcher(searchingFor)) : items;

    return (
        <div>
            {filteredItems.map((item) => (
                <div
                    key={item.id}
                    className={css.item}
                >
                    <div className={css.dateRow}>
                        <div className={css.date}>{renderDateTime(item.dateTime)}</div>
                    </div>

                    {renderer(item, byCode)}
                </div>
            ))}
        </div>
    );
}
