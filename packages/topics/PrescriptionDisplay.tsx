import * as FHIR from "../../utils/FhirTypes";
import { CodeFormatter } from "../../utils/display/CodeFormatter";
import css from "./TopicItemDisplay.module.scss";

interface Props {
    prescription: FHIR.MedicationRequest;
    deleted?: boolean;
}

export function PrescriptionDisplay(props: Props) {
    const p = props.prescription;

    function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.ctrlKey) {
            alert(JSON.stringify(p, null, 2));
        }
    }

    return (
        <div title="Prescription" className={css.container} onClick={onContainerClick}>
            <div className={props.deleted ? css.deleted : ""}>
                <span className={css.title}>
                    {/* {"⚕ "} */}
                    {' 💊 '}
                    {p.medicationCodeableConcept
                        ? new CodeFormatter(p.medicationCodeableConcept).shortText
                        : "NO CODE - control click for more info (FIXME)"}
                        {' '}
                        {p?.dosageInstruction?.[0].doseAndRate?.[0].doseQuantity?.value ?? ''}
                        {' '}
                        {p?.dosageInstruction?.[0].doseAndRate?.[0].doseQuantity?.unit ?? ''}
                        {' '}
                        {new CodeFormatter(p?.dosageInstruction?.[0].timing?.code ?? {}).shortText.toLocaleLowerCase()}
                </span>
            </div>
        </div>
    );
}
