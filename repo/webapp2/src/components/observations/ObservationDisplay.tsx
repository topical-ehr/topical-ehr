import React from "react";
import { Observation } from "../../utils/FhirTypes";
import { DisplayItem } from "../../utils/ObservationsGroup";
import { ObservationFormatter } from "../../utils/display/ObservationFormatter";
import { ChartMini } from "./ChartMini";
import * as VegaTooltip from "vega-tooltip";
import { interpretObservation } from "../../utils/display/ObservationRanges";

import css from "./ObservationDisplay.module.scss";

interface Props {
    item: DisplayItem;
    observationsByCode: Map<string, Observation[]>;
}

export function ObservationDisplay(props: Props) {
    const { item, observationsByCode } = props;

    function renderObservation(obToRender: Observation) {
        const formatter = new ObservationFormatter(obToRender);

        const allObservations = (obToRender.code.coding ?? []).flatMap((code) => {
            const obKey = code.system + "|" + code.code;
            return observationsByCode.get(obKey) ?? [];
        });
        const chartData = allObservations.map((ob) => {
            const formatter = new ObservationFormatter(ob);
            const interpretation = interpretObservation(formatter);
            return {
                date: ob.effectiveDateTime,
                value: formatter.value,
                units: formatter.units,
                range: interpretation.interpretation,
                current: ob.id === obToRender.id,
            };
        });

        return (
            <React.Fragment key={"Observation/" + obToRender.id}>
                <span className={css.title} title={formatter.codeFull}>
                    {formatter.code}
                </span>
                <span className={css.value}>{formatter.value}</span>
                <span className={css.units}>{formatter.units}</span>
                <span className={css.chart}>
                    <ChartMini
                        renderer="svg"
                        data={{ main: chartData }}
                        tooltip={new VegaTooltip.Handler().call}
                    />
                </span>
            </React.Fragment>
        );
    }
    return (
        <React.Fragment>
            {item.item.type === "single" && (
                <div className={css.grid}>{renderObservation(item.item.observation)}</div>
            )}

            {item.item.type === "group" && (
                <div className={css.grid}>{item.item.observations.map(renderObservation)}</div>
            )}
        </React.Fragment>
    );
}
