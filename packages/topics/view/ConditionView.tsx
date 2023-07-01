import * as FHIR from "@topical-ehr/fhir-types";
import { useTopicContext } from "../TopicContext";
import css from "./TopicItemDisplay.module.scss";

import { useFormatting } from "@topical-ehr/formatting/formatting";
import iconDx from "/icons/dx.svg";

export function ConditionsView() {
    const context = useTopicContext();

    if (context.editing) {
        return null;
    }

    return (
        <div>
            {context.topic.conditions.map((c) => (
                <ConditionView
                    key={c.id}
                    condition={c}
                />
            ))}
        </div>
    );
}

interface Props {
    condition: FHIR.Condition;
    deleted?: boolean;
}
function ConditionView(props: Props) {
    const c = props.condition;

    const formatting = useFormatting();

    function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.ctrlKey) {
            alert(JSON.stringify(c, null, 2));
        }
    }

    // clinicalStatus: active | recurrence | relapse | inactive | remission | resolved
    const clinicalStatus = (() => {
        const status = c.clinicalStatus;
        const text = status && formatting.code(status).text;
        if (text === "active") {
            return null; // hide the usual
        } else {
            return text;
        }
    })();

    // verificationStatus: confirmed | unconfirmed | provisional | differential | refuted | entered-in-error
    const verificationStatus = (() => {
        const status = c.verificationStatus;
        const text = status && formatting.code(status).text;
        if (text === "confirmed") {
            return null; // hide the usual
        } else {
            return text;
        }
    })();

    return (
        <div
            title="Diagnosis"
            className={css.container}
            onClick={onContainerClick}
        >
            <div className={props.deleted ? css.deleted : ""}>
                <img src={iconDx} />
                <span className={css.title}>
                    {/* {"⚕ "} */}
                    {c.code ? formatting.code(c.code).shortText : "NO CODE - control click for more info (FIXME)"}
                </span>
                {verificationStatus && <span className={css.status}>{verificationStatus}</span>}
                {clinicalStatus && <span className={css.status}>{clinicalStatus}</span>}
            </div>
        </div>
    );
}
