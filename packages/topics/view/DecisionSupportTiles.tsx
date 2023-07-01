import DOMPurify from "dompurify";

import { useTopicContext } from "../TopicContext";
import { WarningTile } from "@topical-ehr/ui-elements/WarningTile";

interface Props {}

export function DecisionSupportTiles(props: Props) {
    const context = useTopicContext();

    const { composition } = context.topic;
    const html = composition?.section?.[0].text?.div ?? "";

    return <div>{html.match(/heart failure/i) && <WarningTile text="Not on ACE inhibitor" />}</div>;
}
