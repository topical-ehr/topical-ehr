import { DateTime } from "luxon";
import { useMemo } from "react";
import { useFHIRQuery, useFHIR } from "../../redux/FHIR";

import { ObservationFormatter } from "../../utils/display/ObservationFormatter";
import { areOverlapping, DiagnosticReport, Observation } from "../../utils/FhirTypes";
import { ErrorMessage } from "../feedback/ErrorMessage";
import { Loading } from "../feedback/Loading";
import css from "./ObservationGroups.module.scss";

interface Props {
    patientId: string;
}

export function ObservationGroups(props: Props) {
    const query1 = useFHIRQuery(`Observation?subject=Patient/${props.patientId}&_count=1000`);
    const query2 = useFHIRQuery(`DiagnosticReport?subject=Patient/${props.patientId}&_count=1000`);

    const observations = useFHIR((s) => s.fhir.resources.observations);
    const reports = useFHIR((s) => s.fhir.resources.diagnosticReports);

    function getObservationByReference(reference: string): Observation | undefined {
        return observations[reference.split("/")[1]];
    }

    const groupedReports = useMemo(() => {
        const groupedReports = new Map<string, DiagnosticReport[]>();
        for (const r of Object.values(reports)) {
            const text = r.code.text?.replace(/\(.*/, ""); // trim everything after a '('
            if (text && r.result?.length) {
                const list = groupedReports.get(text);
                if (list) {
                    list.push(r);
                } else {
                    groupedReports.set(text, [r]);
                }
            }
        }
        for (const list of groupedReports.values()) {
            list.sort((a, b) =>
                // most recent first
                (b.effectiveDateTime ?? "").localeCompare(a.effectiveDateTime ?? "")
            );
        }
        return groupedReports;
    }, [reports]);

    if (query1.state === "error") {
        return <ErrorMessage error={query1.error} />;
    }
    if (query2.state === "error") {
        return <ErrorMessage error={query2.error} />;
    }
    if (query1.state === "loading" || query2.state === "loading") {
        return <Loading />;
    }

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
                        <div className={css.group_heading}>
                            <h2>{text}</h2>
                            <h3>{relativeDateString}</h3>
                        </div>
                        <div className={css.results_grid}>
                            <div></div>
                            <div className={css.latest_date}>
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
                                            <span className={css.value}>{of.value}</span>
                                            <span className={css.units}>{of.units}</span>
                                        </div>
                                        <div>
                                            <span className={css.value}>{previous?.value}</span>
                                            <span className={css.units}>{previous?.units}</span>
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
