import React from "react";
import { TopicItemEdit } from "./TopicItemEdit";
import { BlankTopicItemState } from "./items/BlankTopicItem";
import { useTopicsConfig } from "../TopicsConfig";
import { useTopicContext } from "../TopicContext";

export function NewItem() {
    const context = useTopicContext();
    const config = useTopicsConfig();

    const [hasData, setHasData] = React.useState<boolean[]>([false]);

    const setHasDataFor = React.useCallback((index: number, newValue: boolean) => {
        // console.log("setHasDataFor", index, newValue);
        setHasData((old) => {
            if (old[index] === newValue) {
                // unchanged
                return old;
            }

            const newHasData = old.map((val, i) => (index === i ? newValue : val));

            const lastValue = newHasData.slice(-1)[0];
            if (lastValue === true) {
                // add blank control
                return [...newHasData, false];
            }

            if (newHasData.length >= 2) {
                const secondLastValue = newHasData.slice(-2)[0];
                if (lastValue == false && secondLastValue == false) {
                    // remove duplicate blank control
                    return newHasData.slice(0, -1);
                }
            }

            return newHasData;
        });
    }, []);

    if (!context.editing) {
        return null;
    }

    const blankState = new BlankTopicItemState(context.topic.composition, config);

    return (
        <div>
            {hasData.map((_, i) => (
                <TopicItemEdit
                    key={i}
                    index={i}
                    setHasData={setHasDataFor}
                    initialState={blankState}
                />
            ))}
        </div>
    );
}
