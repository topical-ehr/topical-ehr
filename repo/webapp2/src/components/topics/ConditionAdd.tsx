import * as FHIR from "../../utils/FhirTypes";
import css from "./ConditionAdd.module.scss";
import AsyncSelect, { useAsync } from "react-select/async";
import { actions, useFHIR } from "../../redux/FhirState";
import { useDispatch } from "react-redux";
import { HoverButtonDelete } from "../editing/HoverButtons";

interface Props {
    conditionId: string;
}

const minInputLengthForSearch = 2;
const showCodes = false;

type Option = FHIR.ValueSet["expansion"]["contains"][0];
// interface Option {
//     label: string;
//     value: string;
// }

export function ConditionAdd(props: Props) {
    const condition = useFHIR((s) => s.fhir.edits.conditions[props.conditionId]);
    const dispatch = useDispatch();

    async function loadOptions(input: string) {
        if (input.length < minInputLengthForSearch) {
            return [];
        }
        const serverBaseUrl = "https://r4.ontoserver.csiro.au/fhir/";
        const snomedRootCode = "138875005";
        const searchUnder = snomedRootCode;
        const codeSystemUrl = `http://snomed.info/sct?fhir_vs=isa/${searchUnder}`;
        const options = "_format=json&count=10&includeDesignations=true";
        const filter = encodeURIComponent(input);
        const url = `${serverBaseUrl}ValueSet/$expand?filter=${filter}&url=${codeSystemUrl}&${options}`;

        const resp = await fetch(url);
        const json: FHIR.ValueSet = await resp.json();
        console.log("loadOptions", json);

        return json.expansion.contains.map((info) => ({
            ...info,
            value: info.code,
            label: info.display,
        }));
    }

    function onChange(newValue: Option | null) {
        if (newValue) {
            const { system, code, display } = newValue;
            const newCondition = {
                ...condition,
                code: {
                    text: newValue?.display,
                    coding: [{ system, code, display, userSelected: true }],
                },
            };
            dispatch(actions.edit(newCondition));
        }
    }

    function onDelete() {}

    function formatOptionWithCode(option: Option) {
        return (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>{option.display}</div>
                <div>{option.code}</div>
            </div>
        );
    }

    return (
        <div className={css.conditionAdd}>
            <AsyncSelect
                loadOptions={loadOptions}
                placeholder="Type a condition"
                isClearable
                isMulti
                components={{
                    DropdownIndicator: null,
                }}
                // onChange={onChange}
                noOptionsMessage={(input) =>
                    input.inputValue.length < minInputLengthForSearch ? null : "Loading..."
                }
                formatOptionLabel={showCodes ? formatOptionWithCode : undefined}
            />

            <HoverButtonDelete onClick={onDelete} />
        </div>
    );
}
