import React from "react";
import AsyncSelect from "react-select/async";
import { useDispatch } from "@topical-ehr/fhir-store";
import { logsFor } from "@topical-ehr/logging";

import { useAutocompleteConfig } from "./AutocompleteConfig";
import { AutocompleteOptionBase, AutocompleteStateBase } from "./AutocompleteBase";
import css from "./AutocompleteEditor.module.scss";

const log = logsFor("AutocompleteEditor");

interface Props {
    initialState: AutocompleteStateBase;
    placeholder: string;

    // notifies parent component if this has data or is empty
    // if has data parent component can create another blank instance
    index: number;
    setHasData: (index: number, hasData: boolean) => void;
}
export function AutocompleteEditor(props: Props) {
    const dispatch = useDispatch();
    const config = useAutocompleteConfig();

    const { initialState, placeholder } = props;
    const initialOptions = initialState.getOptions();
    const stateRef = React.useRef<AutocompleteStateBase>(initialState);
    const [options, setOptions] = React.useState<AutocompleteOptionBase[]>(initialOptions);
    const [defaultOptions, setDefaultOptions] = React.useState<AutocompleteOptionBase[]>(
        [] //initialState.getOptions()
    );

    function applyNewOptions(newOptions: readonly AutocompleteOptionBase[]) {
        const state = stateRef.current;

        if (newOptions.length > options.length) {
            // option added - assuming it is the last one
            return newOptions.slice(-1)[0].onAdded(state);
        } else if (newOptions.length < options.length) {
            // option removed
            const removed = options.find((option) => !newOptions.some((newOption) => newOption.key === option.key));
            if (!removed) {
                return { error: "Could not find removed option" };
            } else {
                return removed.onRemoved(state);
            }
        } else {
            return { error: "newOptions has unchanged size" };
        }
    }

    async function onOptionsChanged(newOptions: readonly AutocompleteOptionBase[]) {
        const state = stateRef.current;
        log.debug("onOptionsChanged", { newOptions, state });

        const result = applyNewOptions(newOptions);
        if (isError(result)) {
            log.error("onOptionsChanged", { result });
        } else {
            log.debug("onOptionsChanged", { result });
            stateRef.current = result.newState;
            result.newActions.forEach(dispatch);
        }

        setOptions([...newOptions]);
        props.setHasData(props.index, newOptions.length > 0);

        const nextOptions = await loadOptions("");
        setDefaultOptions(nextOptions);
    }

    async function loadOptions(input: string) {
        const state = stateRef.current;
        log.debug("loadOptions", { input, stateRef });
        try {
            const options = await state.getSuggestedOptions(input);
            log.debug("loadOptions", { options });
            return options;
        } catch (err) {
            log.error("loadOptions", { err, input, state });
            return [];
        }
    }

    return (
        <div className={css.container}>
            <img
                src={stateRef.current.icon}
                className={css.icon}
            />
            <AsyncSelect
                placeholder={placeholder}
                isClearable
                isMulti
                closeMenuOnSelect={false}
                components={{
                    DropdownIndicator: null,
                }}
                onChange={onOptionsChanged}
                loadOptions={loadOptions}
                defaultOptions={defaultOptions}
                value={options}
                openMenuOnFocus
                // menuIsOpen
                blurInputOnSelect={false}
                // key={JSON.stringify(stateRef.current)}
                noOptionsMessage={(input) =>
                    input.inputValue.length < config.minInputLengthForSearch ? null : "Loading..."
                }
            />
        </div>
    );
}

function isError(obj: any): obj is { error: string } {
    return typeof obj["error"] === "string";
}
