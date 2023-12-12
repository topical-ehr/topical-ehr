import React from "react";
import * as R from "remeda";
import { MultiValueGenericProps, MultiValueRemoveProps, OptionProps, components } from "react-select";
import { Popover, PopoverTrigger, Button, PopoverSurface, MenuList, MenuItem } from "@fluentui/react-components";
import { SearchBox, SearchBoxProps } from "@fluentui/react-search-preview";
import { Tag, TagProps } from "@fluentui/react-components";
import AsyncSelect from "react-select/async";
import { useDispatch } from "@topical-ehr/fhir-store";
import { logsFor } from "@topical-ehr/logging";

import { useAutocompleteConfig } from "./AutocompleteConfig";
import {
    AutocompleteOptionBase,
    AutocompleteStateBase,
    InplaceEdit,
    InplaceEditText,
    UpdateResult,
} from "./AutocompleteBase";
import css from "./AutocompleteEditor.module.scss";
import { ErrorMessage } from "@topical-ehr/ui-elements/ErrorMessage";

const log = logsFor("AutocompleteEditor");

interface Props {
    initialState: AutocompleteStateBase;
    placeholder: string;

    // notifies parent component if this has data or is empty
    // if has data parent component can create another blank instance
    index: number;
    setHasData: (index: number, hasData: boolean) => void;
}

const StateContext = React.createContext<{ state: AutocompleteStateBase; applyUpdate(update: UpdateResult): void } | null>(
    null
);

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

        setOptions([...newOptions]);
        props.setHasData(props.index, newOptions.length > 0);

        const result = applyNewOptions(newOptions);
        await applyUpdate(result);
    }

    async function applyUpdate(update: UpdateResult) {
        if (isError(update)) {
            log.error("onOptionsChanged", { update });
        } else {
            log.debug("onOptionsChanged", { update });
            stateRef.current = update.newState;
            update.newActions.forEach(dispatch);

            setOptions(update.newState.getOptions());
        }

        try {
            const nextOptions = await loadOptions("");
            setDefaultOptions(nextOptions);
        } catch (err) {
            log.error("applyUpdate/loadOptions failed", { err });
        }
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

    function renderControl() {
        return (
            <AsyncSelect
                placeholder={placeholder}
                isClearable
                isMulti
                closeMenuOnSelect={false}
                components={{
                    DropdownIndicator: null,
                    Option: Option,
                    // MultiValueContainer,
                    MultiValueLabel,
                    MultiValueRemove,
                }}
                onChange={onOptionsChanged}
                loadOptions={loadOptions}
                defaultOptions={defaultOptions}
                value={options}
                openMenuOnFocus
                // menuIsOpen
                blurInputOnSelect={false}
                // key={JSON.stringify(stateRef.current)}
                loadingMessage={(input) => (input.inputValue.length < config.minInputLengthForSearch ? null : "Loading...")}
                noOptionsMessage={(input) =>
                    input.inputValue.length < config.minInputLengthForSearch ? null : "No results"
                }
            />
        );
    }

    return (
        <div className={css.container}>
            <img
                src={stateRef.current.icon}
                className={css.icon}
            />
            <StateContext.Provider value={{ state: stateRef.current, applyUpdate }}>
                {renderControl()}
            </StateContext.Provider>
        </div>
    );
}

function isError(obj: any): obj is { error: string } {
    return typeof obj["error"] === "string";
}

function Option(props: OptionProps<AutocompleteOptionBase>) {
    // @ts-ignore
    const { dropdownPrefix } = props.data;

    if (dropdownPrefix) {
        return (
            <components.Option {...props}>
                {dropdownPrefix}
                {props.children}
            </components.Option>
        );
    } else {
        return <components.Option {...props} />;
    }
}

function MultiValueRemove(props: MultiValueRemoveProps<AutocompleteOptionBase>) {
    if (props.data.inplaceEdit() === "remove-me") {
        return <components.MultiValueRemove {...props} />;
    } else {
        return <div style={{ width: "6px" }}> </div>;
    }
}

function MultiValueLabel(props: MultiValueGenericProps<{}>) {
    return (
        <Popover positioning="below">
            <PopoverTrigger disableButtonEnhancement>
                {/* <components.MultiValueLabel {...props} /> */}
                <div
                    style={{
                        fontSize: "85%",
                        padding: "3px",
                        paddingLeft: "6px",
                    }}
                >
                    {props.children}
                </div>
                {/* <Tag>{props.data.label}</Tag> */}
            </PopoverTrigger>

            <PopoverSurface tabIndex={-1}>
                <PopoverEditor option={props.data} />
            </PopoverSurface>
        </Popover>
    );
}

interface PopoverEditorProps {
    option: AutocompleteOptionBase;
}
function PopoverEditor(props: PopoverEditorProps) {
    const context = React.useContext(StateContext);
    const state = context?.state;

    const [options, setOptions] = React.useState<AutocompleteOptionBase[]>();
    const [error, setError] = React.useState<any>();

    if (!state) {
        return <ErrorMessage error="no state in context" />;
    }

    const inplaceEdit = props.option.inplaceEdit();

    if (inplaceEdit === "disallow") {
        return null;
    } else if (inplaceEdit === "remove-me") {
        const result = props.option.onRemoved(state);
        if (isError(result)) {
            return <ErrorMessage error={`onRemoved failed: ${result.error}`} />;
        } else {
            result.newState
                .getSuggestedOptions("")
                .then((newOptions) => {
                    const equal = R.equals(
                        options?.map((o) => o.key),
                        newOptions.map((o) => o.key)
                    );
                    if (!equal) {
                        setOptions(newOptions);
                    }
                })
                .catch((err) => setError(err));
        }

        if (error) {
            return <ErrorMessage error={error} />;
        } else if (options) {
            return <MenuEditor options={options} />;
        } else {
            return "Loading...";
        }
    } else if (inplaceEdit.type === "textarea") {
        return <TextEditor inplaceEdit={inplaceEdit} />;
    } else {
        return <ErrorMessage error="InplaceEdit not supported" />;
    }
}

function MenuEditor({ options }: { options: AutocompleteOptionBase[] }) {
    const context = React.useContext(StateContext);
    const state = context?.state;

    const [filteredOptions, setFilteredOptions] = React.useState(options);
    const onFilterChange: SearchBoxProps["onChange"] = (_ev, data) => {
        const search = data.value.trim().toLowerCase();
        setFilteredOptions(search ? options.filter((opt) => opt.label.toLowerCase().includes(search)) : options);
    };

    if (!state) {
        return <ErrorMessage error="no state in context" />;
    }

    return (
        <div>
            {options.length > 5 && (
                <SearchBox
                    autoFocus
                    onChange={onFilterChange}
                    style={{ marginBottom: "1em" }}
                />
            )}
            <div style={{ maxHeight: "15em", overflowY: "auto" }}>
                {filteredOptions.map((option) => (
                    <MenuItem key={option.key}>{option.label}</MenuItem>
                ))}
            </div>
        </div>
    );
}

function TextEditor({ inplaceEdit }: { inplaceEdit: InplaceEditText }) {
    const context = React.useContext(StateContext);
    const state = context?.state;
    const textarea = React.useRef<HTMLTextAreaElement>(null);

    if (!state) {
        return <ErrorMessage error="no state in context" />;
    }

    return (
        <div>
            <textarea
                ref={textarea}
                defaultValue={inplaceEdit.initialValue}
            ></textarea>
            <br />
            <button
                onClick={() => {
                    const result = inplaceEdit.onSave(textarea.current?.value ?? "ERROR: no textarea", state);
                    context.applyUpdate(result);
                    document.body.click(); // close popover
                }}
            >
                Save
            </button>
        </div>
    );
}
