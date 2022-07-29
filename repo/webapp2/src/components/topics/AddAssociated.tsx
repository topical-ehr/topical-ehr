import React from "react";
import { useDispatch } from "react-redux";
import AsyncSelect from "react-select/async";
import { actions, useFHIR } from "../../redux/FhirState";
import * as FHIR from "../../utils/FhirTypes";
import { HoverButtonDelete } from "../editing/HoverButtons";
import css from "./AddAssociated.module.scss";

const minInputLengthForSearch = 2;
const showCodes = false;

type Option = FHIR.ValueSet["expansion"]["contains"][0];
// interface Option {
//     label: string;
//     value: string;
// }

interface Props {
    compositionId: string;
    index: number;
    setHasData: (index: number, hasData: boolean) => void;
}
export function AddAssociated(props: Props) {
    const composition = useFHIR((s) => s.fhir.edits.compositions[props.compositionId]);
    const dispatch = useDispatch();

    const [resource, setResource] = React.useState<FHIR.Resource | null>(null);

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

    function ensureResourceType(
        wantedResourceType: string
    ): [FHIR.Resource | null, FHIR.Composition] {
        if (resource && resource.resourceType !== wantedResourceType) {
            // delete existing
            dispatch(actions.delete(resource));

            const updatedComposition = FHIR.Composition.removeEntry(
                FHIR.referenceTo(resource),
                composition
            );
            return [null, updatedComposition];
        } else {
            return [resource, composition];
        }
    }

    function getCondition() {
        const [resource, composition] = ensureResourceType("Condition");

        if (resource == null) {
            const newCondition = FHIR.Condition.new({ subject: composition.subject });

            const updatedComposition = FHIR.Composition.addEntry(
                FHIR.referenceTo(newCondition),
                composition
            );
            dispatch(actions.edit(newCondition));
            dispatch(actions.edit(updatedComposition));
            return newCondition;
        } else {
            return resource as FHIR.Condition;
        }
    }

    function onChange(newValues: readonly Option[]) {
        console.log("onChange", newValues);
        for (const newValue of newValues) {
            const { system, code, display } = newValue;
            const newCondition = {
                ...getCondition(),
                code: {
                    text: newValue?.display,
                    coding: [{ system, code, display, userSelected: true }],
                },
            };
            dispatch(actions.edit(newCondition));
            setResource(newCondition);
        }
        props.setHasData(props.index, newValues.length > 0);
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
        <div className={css.container}>
            <AsyncSelect
                loadOptions={loadOptions}
                placeholder="Add an associated diagnosis or prescription"
                isClearable
                isMulti
                // isMulti={resource?.resourceType === "MedicationRequest"}
                components={{
                    DropdownIndicator: null,
                }}
                onChange={onChange}
                noOptionsMessage={(input) =>
                    input.inputValue.length < minInputLengthForSearch ? null : "Loading..."
                }
                // formatOptionLabel={showCodes ? formatOptionWithCode : undefined}
            />

            {resource && <HoverButtonDelete onClick={onDelete} />}
        </div>
    );
}
