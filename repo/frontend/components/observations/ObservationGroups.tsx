import { DateTime } from "luxon";
import React from "react";
import useSWR from "swr";

import { ObservationFormatter } from "../../utils/display/ObservationFormatter";
import { fetchFHIR } from "../../utils/fetcher";
import { areOverlapping, Bundle, DiagnosticReport, Observation } from "../../utils/FhirTypes";
import { ErrorMessage } from "../feedback/ErrorMessage";
import { Loading } from "../feedback/Loading";
import css from "./ObservationGroups.module.scss";

interface Props {
    patientId: string;
}

export function ObservationGroups(props: Props) {
    const { data: observations, error: error1 } = useSWR<Bundle<Observation>>(
        `Observation?subject=Patient/${props.patientId}&_count=1000`,
        fetchFHIR
    );
    const { data: reports, error: error2 } = useSWR<Bundle<DiagnosticReport>>(
        `DiagnosticReport?subject=Patient/${props.patientId}&_count=1000`,
        fetchFHIR
    );

    if (error1 || error2) {
        return (
            <div>
                <ErrorMessage error={error1} />
                <ErrorMessage error={error2} />
            </div>
        );
    }
    if (!observations || !reports) {
        return <Loading />;
    }

    const getObservationByReference = React.useMemo(() => {
        const observationsById = new Map<string, Observation>();
        observations.entry.forEach((entry) => {
            observationsById.set(entry.resource.id, entry.resource);
        });
        return (reference: string) => observationsById.get(reference.split("/")[1]);
    }, [observations]);

    const groupedReports = React.useMemo(() => {
        const groupedReports = new Map<string, DiagnosticReport[]>();
        reports.entry.forEach((entry) => {
            const r = entry.resource;
            const text = r.code.text?.replace(/\(.*/, ""); // trim everything after a '('
            if (text && r.result?.length) {
                const list = groupedReports.get(text);
                if (list) {
                    list.push(r);
                } else {
                    groupedReports.set(text, [r]);
                }
            }
        });
        for (const list of groupedReports.values()) {
            list.sort((a, b) =>
                // most recent first
                (b.effectiveDateTime ?? "").localeCompare(a.effectiveDateTime ?? "")
            );
        }
        return groupedReports;
    }, [reports]);

    return (
        <div>
            {[...groupedReports.entries()].map(([text, reports]) => {
                const latest: DiagnosticReport = reports[0];
                const results = latest.result;
                if (!results) {
                    return null;
                }

                const previous: DiagnosticReport | undefined = reports[1];
                const previousResults = (previous?.result ?? []).map(
                    (r) => r.reference && getObservationByReference(r.reference)
                );

                function getPreviousObservation(ob: Observation) {
                    if (!previousResults) {
                        return null;
                    }
                    // FIXME: do a proper comparison...
                    const previousOb = previousResults.find(
                        (pr) => pr && areOverlapping(pr.code ?? {}, ob.code)
                    );
                    if (!previousOb) {
                        return null;
                    }
                    return new ObservationFormatter(previousOb);
                }

                const ob1 = getObservationByReference(results[0]?.reference ?? "");
                const previousOb1 = ob1 && getPreviousObservation(ob1);

                const relativeDateString =
                    latest.effectiveDateTime &&
                    DateTime.fromISO(latest.effectiveDateTime).toRelativeCalendar();

                return (
                    <div>
                        <div class={css.group_heading}>
                            <h2>{text}</h2>
                            <h3>{relativeDateString}</h3>
                        </div>
                        <div class={css.results_grid}>
                            <div></div>
                            <div>
                                {ob1 &&
                                    new ObservationFormatter(ob1).date?.toLocaleString(
                                        DateTime.DATE_MED
                                    )}
                            </div>
                            <div>
                                {previousOb1 && previousOb1.date?.toLocaleString(DateTime.DATE_MED)}
                            </div>

                            {results.map(({ reference }) => {
                                if (!reference) {
                                    throw new Error(
                                        `missing reference in DiagnosticReport/${latest.id}`
                                    );
                                }
                                const ob = getObservationByReference(reference);
                                const previous = ob && getPreviousObservation(ob);
                                if (!ob) {
                                    throw new Error(
                                        `${reference} not found in DiagnosticReport/${latest.id}`
                                    );
                                }
                                const of = new ObservationFormatter(ob);
                                return (
                                    <>
                                        <div title={of.codeFull}>{of.code}</div>
                                        <div>
                                            <span class={css.value}>{of.value}</span>
                                            <span class={css.units}>{of.units}</span>
                                        </div>
                                        <div>
                                            <span class={css.value}>{previous?.value}</span>
                                            <span class={css.units}>{previous?.units}</span>
                                        </div>
                                    </>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
