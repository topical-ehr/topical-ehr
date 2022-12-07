import { DateTime } from "luxon";
import { useFHIR, useFHIRQuery } from "../../redux/FhirState";
import { ObservationFormatter } from "../../utils/display/ObservationFormatter";
import { Observation } from "../../utils/FhirTypes";
import { groupObservations } from "../../utils/ObservationsGroup";
import { ErrorMessage } from "../feedback/ErrorMessage";
import { Loading } from "../feedback/Loading";
import { ChartMini } from "./ChartMini";
import css from "./ObservationGroups2.module.scss";
import * as VegaTooltip from "vega-tooltip";
import { interpretObservation } from "../../utils/display/ObservationRanges";
import React from "react";

interface Props {
    patientId: string;
}

export function ObservationGroups2(props: Props) {
    const query1 = useFHIRQuery(`Observation?subject=Patient/${props.patientId}&_count=1000`);
    const query2 = useFHIRQuery(`DiagnosticReport?subject=Patient/${props.patientId}&_count=1000`);

    const observations = useFHIR((s) => s.fhir.resources.observations);
    const reports = useFHIR((s) => s.fhir.resources.diagnosticReports);

    if (query1.state === "error") {
        return <ErrorMessage error={query1.error} />;
    }
    if (query2.state === "error") {
        return <ErrorMessage error={query2.error} />;
    }
    if (query1.state === "loading" || query2.state === "loading") {
        return <Loading />;
    }

    const { items, observationsByCode } = groupObservations(reports, observations);

    function renderDateTime(dateTime: string) {
        const luxonDate = DateTime.fromISO(dateTime);
        // luxonDate.toRelativeCalendar();
        return luxonDate.toLocaleString(DateTime.DATE_MED);
    }

    function renderObservation(obToRender: Observation) {
        const of = new ObservationFormatter(obToRender);

        const allObservations = (obToRender.code.coding ?? []).flatMap((code) => {
            const obKey = code.system + "|" + code.code;
            return observationsByCode.get(obKey) ?? [];
        });
        const vegaData = allObservations.map((ob) => {
            const of = new ObservationFormatter(ob);
            const interpretation = interpretObservation(of);
            return {
                date: ob.effectiveDateTime,
                value: of.value,
                units: of.units,
                range: interpretation.interpretation,
                current: ob.id === obToRender.id,
            };
        });

        return (
            <React.Fragment key={"Observation/" + obToRender.id}>
                <span className={css.title} title={of.codeFull}>
                    {of.code}
                </span>
                <span className={css.value}>{of.value}</span>
                <span className={css.units}>{of.units}</span>
                <span className={css.chart}>
                    <ChartMini
                        renderer="svg"
                        data={{ main: vegaData }}
                        tooltip={new VegaTooltip.Handler().call}
                        actions={false}
                    />
                </span>
            </React.Fragment>
        );
    }

    return (
        <div>
            {items.map((item) => (
                <div key={item.id} className={css.item}>
                    <div className={css.dateRow}>
                        <div className={css.date}>{renderDateTime(item.dateTime)}</div>
                        {item.item.type === "single" && renderObservation(item.item.observation)}
                        {item.item.type === "group" && (
                            <div className={css.title} title={item.item.titleFull}>
                                {item.item.title}
                            </div>
                        )}
                    </div>

                    {item.item.type === "group" && (
                        <div className={css.grid}>
                            {item.item.observations.map(renderObservation)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}