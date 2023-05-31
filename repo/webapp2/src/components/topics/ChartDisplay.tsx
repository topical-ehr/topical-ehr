import { DateTime } from "luxon";
import { useFHIR, useFHIRQuery } from "../../redux/FhirState";
import { groupObservations } from "../../utils/ObservationsGroup";
import { ErrorMessage } from "../feedback/ErrorMessage";
import { Loading } from "../feedback/Loading";
import css from "./ChartDisplay.module.scss";
import { ObservationDisplay } from "../observations/ObservationDisplay";

interface Props {
    loincCode: string;
}

export function ChartDisplay(props: Props) {
    const activePatient = useFHIR((s) => s.fhir.activePatient);

    const query1 = useFHIRQuery(
        `Observation?subject=Patient/${activePatient?.id}&code=http://loinc.org|${props.loincCode}`
    );

    const observations = useFHIR((s) => s.fhir.resources.observations);

    if (query1.state === "error") {
        return <ErrorMessage error={query1.error} />;
    }
    if (query1.state === "loading") {
        return <Loading />;
    }

    const { items, observationsByCode } = groupObservations({}, observations);

    return (
        <div className={css.item}>
            <ObservationDisplay item={items[0]} observationsByCode={observationsByCode} />
        </div>
    );
}
