import { SearchBox } from "@fluentui/react";
import { useParams } from "react-router-dom";
import patient from "../../pages/patient";
import { useFHIRQuery, useFHIR } from "../../redux/FhirState";
import { PatientFormatter } from "../../utils/display/PatientFormatter";
import { ErrorMessage } from "../feedback/ErrorMessage";
import { Loading } from "../feedback/Loading";
import css from "./PatientHeader.module.scss";

export function PatientHeader() {
    const { patientId } = useParams();
    if (!patientId) {
        throw new Error(`PatientHeader missing patientId`);
    }

    const query = useFHIRQuery(`Patient/${patientId}`);
    const patient = useFHIR((s) => s.fhir.resources.patients[patientId]);
    if (query.state === "error") {
        return <ErrorMessage error={query.error} />;
    }
    if (query.state === "loading") {
        return <Loading />;
    }

    const pf = new PatientFormatter(patient);
    const { age, gender, born } = pf.ageGenderBorn;
    const lines = [
        `${age}  ·  ${gender} · ${born}`,
        // `${age}  ·  ${gender}`,
        // born,
    ];
    return (
        <div className={css.container}>
            <div className={css.name}>{pf.name}</div>
            <div className={css.details}>
                {lines.map((line) => (
                    <div className={css.summary} key={line}>
                        {line}
                    </div>
                ))}
            </div>
            <SearchBox
                placeholder="Search"
                showIcon
                onSearch={(newValue) => console.log("value is " + newValue)}
            />
        </div>
    );
}
