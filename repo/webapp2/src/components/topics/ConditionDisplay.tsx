import * as FHIR from "../../utils/FhirTypes";
import { CodeFormatter } from "../../utils/display/CodeFormatter";
import css from "./ConditionDisplay.module.scss";

import iconDx from "/icons/dx.svg";

interface Props {
    condition: FHIR.Condition;
    deleted?: boolean;
}

export function ConditionDisplay(props: Props) {
    const c = props.condition;

    function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.ctrlKey) {
            alert(JSON.stringify(c, null, 2));
        }
    }

    // clinicalStatus: active | recurrence | relapse | inactive | remission | resolved
    const clinicalStatus = (() => {
        const status = c.clinicalStatus;
        const text = status && new CodeFormatter(status).text;
        if (text === "active") {
            return null; // hide the usual
        } else {
            return text;
        }
    })();

    // verificationStatus: confirmed | unconfirmed | provisional | differential | refuted | entered-in-error
    const verificationStatus = (() => {
        const status = c.verificationStatus;
        const text = status && new CodeFormatter(status).text;
        if (text === "confirmed") {
            return null; // hide the usual
        } else {
            return text;
        }
    })();

    return (
        <div title="Diagnosis" className={css.container} onClick={onContainerClick}>
            <div className={props.deleted ? css.deleted : ""}>
                <img src={iconDx} />
                <span className={css.title}>
                    {/* {"⚕ "} */}
                    {c.code
                        ? new CodeFormatter(c.code).shortText
                        : "NO CODE - control click for more info (FIXME)"}
                </span>
                {verificationStatus && <span className={css.status}>{verificationStatus}</span>}
                {clinicalStatus && <span className={css.status}>{clinicalStatus}</span>}
            </div>
        </div>
    );
}
