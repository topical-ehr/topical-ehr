import { useState } from "react";
import { useFHIR, useFHIRQuery } from "../../redux/FhirState";
import { ErrorMessage } from "../feedback/ErrorMessage";
import { Loading } from "../feedback/Loading";
import { ConditionTile } from "./ConditionTile";

interface Props {
    patientId: string;
}

export function ConditionList(props: Props) {
    const [filter, setFilter] = useState<string | null>(null);

    const query = useFHIRQuery(`Condition?subject=Patient/${props.patientId}`);
    const conditions = useFHIR((s) => s.fhir.resources.conditions);

    if (query.state === "error") {
        return <ErrorMessage error={query.error} />;
    }
    if (query.state === "loading") {
        return <Loading />;
    }

    return (
        <div>
            {[...Object.values(conditions)].map((c) => {
                return <ConditionTile condition={c} key={c.id} />;
            })}
        </div>
    );
}
