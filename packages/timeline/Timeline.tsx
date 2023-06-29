import { DateTime } from "luxon";

import { FhirResources, State, useFHIR } from "@topical-ehr/fhir-store";
import { TimelineItem } from "./TimelineItem";

import css from "./Timeline.module.scss";
import { ObservationDisplay } from "./observations/ObservationDisplay";

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
                        className={css.title}
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
    }
}

export function Timeline(props: Props) {
    const { groupers, renderer } = props;

    const resources = useFHIR((s) => s.fhir.resources);
    const byCode = useFHIR((s) => s.fhir.byCode);

    const items = React.useMemo(() => {
        const items = groupers.flatMap((g) => g(resources));
        items.sort((a, b) => a.dateTime.localeCompare(b.dateTime));
        return items;
    }, [groupers, resources]);

    function renderDateTime(dateTime: string) {
        const luxonDate = DateTime.fromISO(dateTime);
        // luxonDate.toRelativeCalendar();
        return luxonDate.toLocaleString(DateTime.DATE_MED);
    }

    return (
        <div>
            {items.map((item) => (
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
