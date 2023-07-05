import React from "react";

import * as FHIR from "@topical-ehr/fhir-types";
import { useFormatting } from "@topical-ehr/formatting/formatting";

import { ChartMini } from "./ChartMini";
import css from "./ObservationDisplay.module.scss";
import { ByCode } from "@topical-ehr/fhir-store";

interface Props {
    observations: FHIR.Observation[];
    observationsByCode: ByCode<FHIR.Observation>;
}

export function ObservationDisplay(props: Props) {
    const { observations, observationsByCode } = props;

    const formatting = useFormatting();

    function renderObservation(obToRender: FHIR.Observation) {
        const formatter = formatting.observation(obToRender);

        const allObservations = (obToRender.code.coding ?? []).flatMap((code) => {
            const obKey = code.system + "|" + code.code;
            return observationsByCode[obKey] ?? [];
        });
        const chartData = allObservations.map((ob) => {
            const formatter = formatting.observation(ob);
            const interpretation = formatter.interpret;
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
                <span
                    className={css.title}
                    title={formatter.codeFull}
                >
                    {formatter.code}
                </span>
                <span className={css.value}>{formatter.value}</span>
                <span className={css.units}>{formatter.units}</span>
                <span className={css.chart}>
                    <ChartMini
                        renderer="svg"
                        data={{ main: chartData }}
                    />
                </span>
            </React.Fragment>
        );
    }
    return (
        <React.Fragment>
            <div className={css.grid}>{observations.map(renderObservation)}</div>
        </React.Fragment>
    );
}
