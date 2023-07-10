import { useFormatting } from "@topical-ehr/formatting/formatting";
import { useTopicContext } from "../TopicContext";
import { WarningTile } from "@topical-ehr/ui-elements/WarningTile";

interface Props {}

export function DecisionSupportTiles(props: Props) {
    const context = useTopicContext();
    const formatting = useFormatting();

    const { composition, conditions, prescriptions } = context.topic;
    const summaryHTML = composition?.section?.[0].text?.div ?? "";

    const meds = prescriptions.map((p) =>
        p.medicationCodeableConcept ? formatting.code(p.medicationCodeableConcept).shortText : ""
    );

    return (
        <div>
            {summaryHTML.match(/heart failure/i) && !meds.some((m) => m.endsWith("pril") || m.endsWith("sartan")) && (
                <WarningTile text="Not on ACEI/ARB" />
            )}
        </div>
    );
}
