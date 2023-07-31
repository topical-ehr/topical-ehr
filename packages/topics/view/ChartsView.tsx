import * as FHIR from "@topical-ehr/fhir-types";
import { ObservationDisplay } from "@topical-ehr/observations/ObservationDisplay";
import { useTopicContext } from "../TopicContext";
import { useFHIR } from "@topical-ehr/fhir-store";

export function ChartsView() {
    const context = useTopicContext();
    const { composition } = context.topic;

    return (
        <div title="Relevant graphs">
            {composition?.title.match(/diabetes|T[12]DM/i) && <ChartView loincCode="4548-4" />}
        </div>
    );
}
interface Props {
    loincCode: string;
}

function ChartView(props: Props) {
    const { loincCode } = props;
    const loinc = "http://loinc.org";

    const observationsByCode = useFHIR((s) => s.fhir.byCode.observations);
    const allObservations = useFHIR((s) => s.fhir.resourcesWithEdits.observations);

    const observations = Object.values(allObservations).filter((ob) =>
        ob.code.coding?.some((c) => c.system === loinc && c.code === loincCode)
    );
    const newest = newestObservation(observations);

    if (!newest) {
        return null;
    }

    return (
        <div>
            <ObservationDisplay
                observations={[newest]}
                observationsByCode={observationsByCode}
            />
        </div>
    );
}

function newestObservation(observations: FHIR.Observation[]) {
    let newestDate: string | null | undefined = null;
    let newestOb: FHIR.Observation | null = null;

    for (const ob of observations) {
        if (!newestDate || (ob.effectiveDateTime && ob.effectiveDateTime.localeCompare(newestDate) > 0)) {
            newestDate = ob.effectiveDateTime;
            newestOb = ob;
        }
    }

    return newestOb;
}
