import { useTopicContext } from "../TopicContext";

import { useTopicsConfig } from "../TopicsConfig";
import { TopicItemEdit } from "./TopicItemEdit";
import { ConditionTopicItemState } from "./items/ConditionTopicItems";

export function ConditionsEdit() {
    const config = useTopicsConfig();
    const context = useTopicContext();

    if (!context.editing) {
        return null;
    }

    return (
        <div>
            {context.topic.conditions.map((c) => (
                <TopicItemEdit
                    key={c.id}
                    initialState={new ConditionTopicItemState([c], context.topic.composition, config)}
                    index={0}
                    setHasData={nop}
                />
            ))}
        </div>
    );
}

function nop() {}
