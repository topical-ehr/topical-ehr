import { ObservationDisplay } from "@topical-ehr/observations/ObservationDisplay";
import { useTopicContext } from "../TopicContext";
import { useFHIR } from "@topical-ehr/fhir-store";

export function ChartsView(props: Props) {
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
    const allObservations = useFHIR((s) => s.fhir.resources.observations);

    const observations = Object.values(allObservations).filter((ob) =>
        ob.code.coding?.some((c) => c.system === loinc && c.code === loincCode)
    );

    return (
        <div>
            <ObservationDisplay
                observations={observations}
                observationsByCode={observationsByCode}
            />
        </div>
    );
}
