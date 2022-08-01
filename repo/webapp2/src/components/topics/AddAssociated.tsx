import { labelProperties } from "@fluentui/react";
import React from "react";
import { useDispatch } from "react-redux";
import AsyncSelect from "react-select/async";
import { actions, useFHIR } from "../../redux/FhirState";
import * as FHIR from "../../utils/FhirTypes";
import { HoverButtonDelete } from "../editing/HoverButtons";
import css from "./AddAssociated.module.scss";

const minInputLengthForSearch = 2;
const showCodes = false;

type Addition =
    | {
          type: "conditions";
          conditions: FHIR.Condition[];
      }
    | {
          type: "requests";
          request: FHIR.ServiceRequest;
      }
    | {
          type: "prescription";
          request: FHIR.MedicationRequest;
      };

type Term = FHIR.ValueSet["expansion"]["contains"][0];
interface Option {
    label: string;
    value:
        | {
              type: "condition";
              term: Term;
          }
        | {
              type: "request";
              term: Term;
          }
        | {
              type: "medication";
              term: Term;
          }
        | {
              type: "dosage";
              dosage: FHIR.Quantity;
          }
        | {
              type: "frequency";
              term: Term;
          };
    valueJSON: string;
}
type OptionType = Option["value"]["type"];

interface Props {
    compositionId: string;
    index: number;
    setHasData: (index: number, hasData: boolean) => void;
}
export function AddAssociated(props: Props) {
    const dispatch = useDispatch();
    const composition = useFHIR((s) => s.fhir.edits.compositions[props.compositionId]);

    const [state, setState] = React.useState<Addition | null>(null);
    const [options, setOptions] = React.useState<Option[]>([]);

    function addToComposition(resource: FHIR.Resource) {
        const updatedComposition = FHIR.Composition.addEntry(
            FHIR.referenceTo(resource),
            composition
        );
        dispatch(actions.edit(updatedComposition));
    }
    function removeFromComposition(resource: FHIR.Resource) {
        const updatedComposition = FHIR.Composition.removeEntry(
            FHIR.referenceTo(resource),
            composition
        );
        dispatch(actions.edit(updatedComposition));
    }

    function addCondition(term: Term): Addition | { error: string } {
        const { system, code, display } = term;
        const newCondition: FHIR.Condition = {
            ...FHIR.Condition.new({ subject: composition.subject }),
            code: {
                text: display,
                coding: [{ system, code, display, userSelected: true }],
            },
        };
        dispatch(actions.edit(newCondition));
        addToComposition(newCondition);
        if (state == null) {
            return { type: "conditions", conditions: [newCondition] };
        }
        if (state.type === "conditions") {
            return { ...state, conditions: [...state.conditions, newCondition] };
        }
        return { error: "unexpected addition type" };
    }

    function addMedication(term: Term): Addition | { error: string } {
        const { system, code, display } = term;
        const request: FHIR.MedicationRequest = {
            ...FHIR.MedicationRequest.new({
                subject: composition.subject,
                status: "active",
                intent: "plan",
            }),
            medicationCodeableConcept: {
                text: display,
                coding: [{ system, code, display, userSelected: true }],
            },
        };
        dispatch(actions.edit(request));
        addToComposition(request);
        if (state == null) {
            return { type: "prescription", request };
        }
        return { error: "expected a blank state when adding a medication" };
    }

    function addDosage(dosage: FHIR.Quantity): Addition | { error: string } {
        if (state?.type == "prescription") {
            const request: FHIR.MedicationRequest = {
                ...state.request,
                dosageInstruction: [
                    {
                        ...state.request.dosageInstruction?.[0],
                        doseAndRate: [
                            {
                                doseQuantity: dosage,
                            },
                        ],
                    },
                ],
            };
            dispatch(actions.edit(request));
            return { type: "prescription", request };
        }
        return { error: "expected prescription state when adding a dosage" };
    }

    function onOptionAdded(newOption: Option): Addition | { error: string } {
        switch (newOption.value.type) {
            case "condition":
                return addCondition(newOption.value.term);
            case "medication":
                return addMedication(newOption.value.term);
            case "dosage":
                return addDosage(newOption.value.dosage);
        }

        return { error: "unexpected option type" };
    }

    function onOptionRemoved(removedOption: Option): Addition | { error: string } {
        switch (removedOption.value.type) {
            case "condition":
                const removedCode = removedOption.value.term.code;
                if (state?.type === "conditions") {
                    const toRemove = state.conditions.find(
                        (condition) => condition.code?.coding?.[0].code === removedCode
                    );
                    if (!toRemove) {
                        return { error: "unable to find existing condition" };
                    }
                    dispatch(actions.delete(toRemove));
                    removeFromComposition(toRemove);

                    return {
                        ...state,
                        conditions: state.conditions.filter((condition) => condition !== toRemove),
                    };
                }
                return { error: "unexpected addition type" };
        }

        return { error: "unexpected option type" };
    }

    function applyNewOptions(newOptions: readonly Option[]) {
        if (newOptions.length > options.length) {
            // option added - assuming it is the last one
            return onOptionAdded(newOptions.slice(-1)[0]);
        } else if (newOptions.length < options.length) {
            // option removed
            const removed = options.find(
                (option) =>
                    !newOptions.some((newOption) => newOption.valueJSON === option.valueJSON)
            );
            if (!removed) {
                return { error: "Could not find removed option" };
            } else {
                return onOptionRemoved(removed);
            }
        } else {
            return { error: "newOptions has unchanged size" };
        }
    }

    function onOptionsChanged(newOptions: readonly Option[]) {
        console.log("onOptionsChanged", newOptions);

        const result = applyNewOptions(newOptions);
        if (isError(result)) {
            console.error(result.error, { newOptions, options, state });
        } else {
            setState(result);
        }

        setOptions([...newOptions]);
        props.setHasData(props.index, newOptions.length > 0);
    }

    async function loadOptions(input: string) {
        console.log("loadOptions", { input });
        try {
            const ret = await _loadOptions(input);
            console.log("loadOptions", { ret });
            return ret;
        } catch (err) {
            console.error("loadOptions", err, { input, state });
            return [];
        }
    }
    async function _loadOptions(input: string) {
        if (!state) {
            return await loadOptionsFromTerminology(input, SearchScope.root);
        }
        switch (state.type) {
            case "conditions":
                return await loadOptionsFromTerminology(input, SearchScope.clinicalFinding);
            case "prescription":
                const medication = state.request.medicationCodeableConcept?.text;
                if (!medication) {
                    throw new Error("state is missing medication text");
                }

                if (!state.request.dosageInstruction?.[0].doseAndRate) {
                    // need a dose

                    const productDoses = await getDosesFor(medication);
                    const userEnteredDoses = new Set<string>();

                    if (isNumeric(input)) {
                        // add option to directly enter what has been typed in
                        const units = new Set([...productDoses].map((d) => parseDose(d)?.unit));
                        for (const unit of [...units]) {
                            if (unit) {
                                const dose = input + " " + unit;
                                userEnteredDoses.add(dose);
                                productDoses.delete(dose);
                            }
                        }
                    }

                    const options = [...userEnteredDoses, ...productDoses].map((dose) => ({
                        value: { type: "dosage", dosage: parseDose(dose) } as Option["value"],
                        label: dose,
                        valueJSON: JSON.stringify(dose),
                    }));

                    return options;
                }

                if (!state.request.dosageInstruction?.[0].timing) {
                    // need frequency
                }
                return await loadOptionsFromTerminology(input, SearchScope.frequencyPerUnitTime);
        }

        return [];
    }

    return (
        <div className={css.container}>
            <AsyncSelect
                placeholder="Add orders, prescriptions or associated diagnoses"
                isClearable
                isMulti
                components={{
                    DropdownIndicator: null,
                }}
                onChange={onOptionsChanged}
                loadOptions={loadOptions}
                noOptionsMessage={(input) =>
                    input.inputValue.length < minInputLengthForSearch ? null : "Loading..."
                }
                formatOptionLabel={showCodes ? formatOptionWithCode : undefined}
            />
        </div>
    );
}

const SearchScope = {
    root: "138875005",
    clinicalFinding: "404684003",

    medicinalProductUnitOfUse: "30450011000036109",

    frequencyPerUnitTime: "307431003",
};

async function searchTerminology(input: string, searchScope: string): Promise<FHIR.ValueSet> {
    const serverBaseUrl = "https://r4.ontoserver.csiro.au/fhir/";
    const codeSystemUrl = `http://snomed.info/sct?fhir_vs=isa/${searchScope}`;

    const designation = encodeURIComponent("http://snomed.info/sct|900000000000003001");

    // TODO: designation filter doesn't seem to work
    const options = `_format=json&count=10&includeDesignations=true&designation=${designation}`;
    const filter = encodeURIComponent(input);
    const url = `${serverBaseUrl}ValueSet/$expand?filter=${filter}&url=${codeSystemUrl}&${options}`;

    const resp = await fetch(url);
    const vs: FHIR.ValueSet = await resp.json();
    console.log({ vs });
    return vs;
}

function parseDose(dose: string): FHIR.Quantity | null {
    const match = dose.match(/\d+ \w+/)?.[0];
    if (match) {
        const [value, unit] = match.split(" ");
        return {
            value: parseInt(value, 10),
            unit,
        };
    } else {
        return null;
    }
}

async function getDosesFor(medication: string): Promise<Set<string>> {
    const vs = await searchTerminology(medication, SearchScope.medicinalProductUnitOfUse);

    const doses = new Set<string>();
    for (const term of vs.expansion.contains) {
        const qty = parseDose(term.display);
        if (qty) {
            doses.add(qty.value + " " + qty.unit);
        }
    }

    // sort
    function value(str: string) {
        return parseInt(str.split(" ")[0]);
    }
    return new Set([...doses].sort((a, b) => value(a) - value(b)));
}

async function loadOptionsFromTerminology(input: string, searchScope: string): Promise<Option[]> {
    if (input.length < minInputLengthForSearch) {
        return [];
    }

    const vs = await searchTerminology(input, searchScope);

    const values = vs.expansion.contains.flatMap((term) => {
        const fullySpecifiedName = term.designation?.find(
            (d) => d.use?.code === "900000000000003001"
        )?.value;
        if (!fullySpecifiedName) {
            return [];
        }
        const termType = fullySpecifiedName?.slice(fullySpecifiedName.indexOf("(") + 1, -1);
        switch (termType) {
            case "finding":
            case "disorder":
                return [{ type: "condition", term }];
            case "substance":
                return [{ type: "medication", term }];
        }
        return [];
    });

    const options = values.map((v) => ({
        value: v as Option["value"],
        label: v.term.display,
        valueJSON: JSON.stringify(v),
    }));
    return options;
}

function isError(obj: any): obj is { error: string } {
    return typeof obj["error"] === "string";
}

function isNumeric(str: string) {
    return parseInt(str, 10) + "" == str;
}

function formatOptionWithCode(option: Option) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>{option.label}</div>
            <div>{option.value.type}</div>
        </div>
    );
}
