import { DateTime } from "luxon";
import { useFHIR, useFHIRQuery } from "../../redux/FhirState";
import { groupObservations } from "../../utils/ObservationsGroup";
import { ErrorMessage } from "../feedback/ErrorMessage";
import { Loading } from "../feedback/Loading";
import { ObservationDisplay } from "./ObservationDisplay";
import css from "./ObservationGroups2.module.scss";

interface Props {
    patientId: string;
}

export function ObservationGroups2(props: Props) {
    const query1 = useFHIRQuery(`Observation?subject=Patient/${props.patientId}`);
    const query2 = useFHIRQuery(`DiagnosticReport?subject=Patient/${props.patientId}`);

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


    return (
        <div>
            {items.map((item) => (
                <div key={item.id} className={css.item}>
                    <div className={css.dateRow}>
                        <div className={css.date}>{renderDateTime(item.dateTime)}</div>

                        {item.item.type === "group" && (
                            <div className={css.title} title={item.item.titleFull}>
                                {item.item.title}
                            </div>
                        )}
                    </div>

                    <ObservationDisplay item={item} observationsByCode={observationsByCode} />
                </div>
            ))}
        </div>
    );
}
