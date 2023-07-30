import React from "react";

import { AutocompleteEditor } from "@topical-ehr/ui-autocomplete/AutocompleteEditor";
import { AutocompleteStateBase } from "./AutocompleteBase";

interface Props {
    initialState: AutocompleteStateBase;
    placeholder: string;
}
export function NewAutocompleteEditors(props: Props) {
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

    return (
        <>
            {hasData.map((_, i) => (
                <AutocompleteEditor
                    key={i}
                    index={i}
                    setHasData={setHasDataFor}
                    initialState={props.initialState}
                    placeholder={props.placeholder}
                />
            ))}
        </>
    );
}
