import { useTopicContext } from "../TopicContext";

import { useTopicsConfig } from "../TopicsConfig";
import { TopicItemEdit } from "./TopicItemEdit";
import { PrescriptionTopicItemState } from "./items/PrescriptionTopicItems";

export function PrescriptionsEdit() {
    const config = useTopicsConfig();
    const context = useTopicContext();

    if (!context.editing) {
        return null;
    }

    return (
        <div>
            {context.topic.prescriptions.map((p) => (
                <TopicItemEdit
                    key={p.id}
                    initialState={new PrescriptionTopicItemState(p, context.topic.composition, config)}
                    index={0}
                    setHasData={nop}
                />
            ))}
        </div>
    );
}

function nop() {}
