import { AnyAction } from "@reduxjs/toolkit";
import React from "react";
import { useDispatch } from "react-redux";
import AsyncSelect from "react-select/async";
import { actions, useFHIR } from "../../redux/FhirState";
import * as FHIR from "../../utils/FhirTypes";
import { logsForModule } from "../../utils/logger";
import { timingCodesAllowed } from "../prescriptions/TimingCodes";
import css from "./AddAssociated.module.scss";

const _log = logsForModule("AddAssociated");

const minInputLengthForSearch = 2;

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

abstract class Option {
    public readonly key: string;
    public readonly value: Option;
    constructor(
        public readonly label: string,
        public readonly keyData: any,
        public readonly composition: FHIR.Composition
    ) {
        this.key = JSON.stringify(keyData);
        this.value = this;
    }

    abstract onAdded(state: Addition | null): UpdateResult;
    abstract onRemoved(state: Addition | null): UpdateResult;

    protected addToComposition(resource: FHIR.Resource) {
        const updatedComposition = FHIR.Composition.addEntry(
            FHIR.referenceTo(resource),
            this.composition
        );
        return actions.edit(updatedComposition);
    }
    protected removeFromComposition(resource: FHIR.Resource) {
        const updatedComposition = FHIR.Composition.removeEntry(
            FHIR.referenceTo(resource),
            this.composition
        );
        return actions.edit(updatedComposition);
    }
}
type UpdateResult =
    | {
          newState: Addition | null;
          newActions: AnyAction[];
      }
    | { error: string };

class ConditionOption extends Option {
    constructor(private term: Term, composition: FHIR.Composition) {
        super(term.display, term, composition);
    }

    onAdded(state: Addition | null): UpdateResult {
        const { system, code, display } = this.term;
        const newCondition: FHIR.Condition = {
            ...FHIR.Condition.new({ subject: this.composition.subject }),
            code: {
                text: display,
                coding: [{ system, code, display, userSelected: true }],
            },
        };

        const newActions = [actions.edit(newCondition), this.addToComposition(newCondition)];
        if (state == null) {
            return {
                newState: { type: "conditions", conditions: [newCondition] },
                newActions,
            };
        }
        if (state.type === "conditions") {
            return {
                newState: { ...state, conditions: [...state.conditions, newCondition] },
                newActions,
            };
        }
        return { error: "unexpected addition type" };
    }

    onRemoved(state: Addition | null): UpdateResult {
        const removedCode = this.term.code;
        if (state?.type !== "conditions") {
            return { error: "unexpected addition type" };
        }
        const toRemove = state.conditions.find(
            (condition) => condition.code?.coding?.[0].code === removedCode
        );
        if (!toRemove) {
            return { error: "unable to find existing condition" };
        }

        const conditions = state.conditions.filter((condition) => condition !== toRemove);

        return {
            newState:
                conditions.length == 0
                    ? null
                    : {
                          ...state,
                          conditions,
                      },
            newActions: [actions.delete(toRemove), this.removeFromComposition(toRemove)],
        };
    }
}

class MedicationOption extends Option {
    constructor(private term: Term, composition: FHIR.Composition) {
        super(term.display, term, composition);
    }

    onAdded(state: Addition | null): UpdateResult {
        const { system, code, display } = this.term;
        const request: FHIR.MedicationRequest = {
            ...FHIR.MedicationRequest.new({
                subject: this.composition.subject,
                status: "active",
                intent: "plan",
            }),
            medicationCodeableConcept: {
                text: display,
                coding: [{ system, code, display, userSelected: true }],
            },
        };

        if (state == null) {
            return {
                newState: { type: "prescription", request },
                newActions: [actions.edit(request), this.addToComposition(request)],
            };
        }
        return { error: "expected a blank state when adding a medication" };
    }

    onRemoved(state: Addition | null): UpdateResult {
        if (state?.type !== "prescription") {
            return { error: "unexpected addition type" };
        }

        return {
            newState: null,
            newActions: [actions.delete(state.request), this.removeFromComposition(state.request)],
        };
    }
}

class DosageOption extends Option {
    constructor(
        private dosage: FHIR.Quantity | FHIR.Range,
        label: string,
        composition: FHIR.Composition
    ) {
        super(label, dosage, composition);
    }

    onAdded(state: Addition | null): UpdateResult {
        if (state?.type !== "prescription") {
            return { error: "expected prescription state when adding a dosage" };
        }

        function isRange(dosage: any): dosage is FHIR.Range {
            return !!dosage["low"];
        }
        const dosage = this.dosage;
        const request: FHIR.MedicationRequest = {
            ...state.request,
            dosageInstruction: [
                {
                    ...state.request.dosageInstruction?.[0],
                    doseAndRate: [
                        {
                            doseRange: isRange(dosage) ? dosage : undefined,
                            doseQuantity: !isRange(dosage) ? dosage : undefined,
                        },
                    ],
                },
            ],
        };
        return { newState: { type: "prescription", request }, newActions: [actions.edit(request)] };
    }

    onRemoved(state: Addition | null): UpdateResult {
        if (state?.type !== "prescription") {
            return { error: "unexpected addition type" };
        }

        const request: FHIR.MedicationRequest = {
            ...state.request,
            dosageInstruction: [
                {
                    ...state.request.dosageInstruction?.[0],
                    doseAndRate: undefined,
                },
            ],
        };

        return {
            newState: { ...state, request },
            newActions: [actions.edit(request)],
        };
    }
}

class FrequencyOption extends Option {
    constructor(display: string, private timing: FHIR.Timing, composition: FHIR.Composition) {
        super(display, display, composition);
    }

    onAdded(state: Addition | null): UpdateResult {
        if (state?.type !== "prescription") {
            return { error: "expected prescription state when adding a dosage frequency" };
        }

        const request: FHIR.MedicationRequest = {
            ...state.request,
            dosageInstruction: [
                {
                    ...state.request.dosageInstruction?.[0],
                    timing: this.timing,
                },
            ],
        };
        return { newState: { type: "prescription", request }, newActions: [actions.edit(request)] };
    }

    onRemoved(state: Addition | null): UpdateResult {
        if (state?.type !== "prescription") {
            return { error: "unexpected addition type" };
        }

        const request: FHIR.MedicationRequest = {
            ...state.request,
            dosageInstruction: [
                {
                    ...state.request.dosageInstruction?.[0],
                    timing: undefined,
                },
            ],
        };

        return {
            newState: { ...state, request },
            newActions: [actions.edit(request)],
        };
    }
}

interface Props {
    compositionId: string;

    // notifies parent component if this has data or is empty
    // if has data parent component can create another blank instance
    index: number;
    setHasData: (index: number, hasData: boolean) => void;
}
export function AddAssociated(props: Props) {
    const dispatch = useDispatch();
    const composition = useFHIR((s) => s.fhir.edits.compositions[props.compositionId]);

    const stateRef = React.useRef<Addition | null>(null);
    const [options, setOptions] = React.useState<Option[]>([]);
    const [defaultOptions, setDefaultOptions] = React.useState<Option[]>([]);

    function applyNewOptions(newOptions: readonly Option[]) {
        const state = stateRef.current;

        if (newOptions.length > options.length) {
            // option added - assuming it is the last one
            return newOptions.slice(-1)[0].onAdded(state);
        } else if (newOptions.length < options.length) {
            // option removed
            const removed = options.find(
                (option) => !newOptions.some((newOption) => newOption.key === option.key)
            );
            if (!removed) {
                return { error: "Could not find removed option" };
            } else {
                return removed.onRemoved(state);
            }
        } else {
            return { error: "newOptions has unchanged size" };
        }
    }

    async function onOptionsChanged(newOptions: readonly Option[]) {
        const state = stateRef.current;
        console.log("onOptionsChanged", { newOptions });

        const result = applyNewOptions(newOptions);
        if (isError(result)) {
            console.error("onOptionsChanged", result.error, { newOptions, options, state });
        } else {
            console.log("onOptionsChanged", { result, stateRef });
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
        console.log("loadOptions", { input, stateRef });
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
        const state = stateRef.current;
        if (!state) {
            return await loadOptionsFromTerminology(input, SearchScope.root, composition);
        }
        switch (state.type) {
            case "conditions":
                return await loadOptionsFromTerminology(
                    input,
                    SearchScope.clinicalFinding,
                    composition
                );
            case "prescription":
                const medication = state.request.medicationCodeableConcept?.text;
                if (!medication) {
                    throw new Error("state is missing medication text");
                }

                if (!state.request.dosageInstruction?.[0].doseAndRate) {
                    console.debug("need dose");
                    // need a dose
                    // examples
                    //   [25 mg] [twice a day]
                    //   [5-10 mg] [every 4-6 hours] [PRN]
                    //   [10-20 mg] [over 24 hours] [subcut]

                    const productDoses = await getDosesFor(medication);
                    console.debug("need dose", { productDoses, medication });
                    const userEnteredDoses = new Set<string>();

                    if (isNumeric(input) || isNumericRange(input)) {
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
                    function throwError(msg: string): never {
                        throw new Error(msg);
                    }
                    const options = [...userEnteredDoses, ...productDoses].map(
                        (dose) =>
                            new DosageOption(
                                parseDose(dose) ??
                                    parseDoseRange(dose) ??
                                    throwError("dose could not be parsed"),
                                dose,
                                composition
                            )
                    );

                    return options;
                }

                if (!state.request.dosageInstruction?.[0].timing) {
                    console.debug("need frequency");

                    const inputTrimmed = input.trim().toLocaleLowerCase();
                    const timings = inputTrimmed
                        ? timingCodesAllowed.filter((t) =>
                              t.texts.some((s) => s.includes(inputTrimmed))
                          )
                        : timingCodesAllowed;

                    return timings.map(
                        (t) => new FrequencyOption(t.timing.code!.text!, t.timing, composition)
                    );
                }
                return await loadOptionsFromTerminology(
                    input,
                    SearchScope.timePatterns,
                    composition
                );
        }

        return [];
    }

    return (
        <div className={css.container}>
            <AsyncSelect
                placeholder="Add orders, prescriptions or associated diagnoses"
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
                    input.inputValue.length < minInputLengthForSearch ? null : "Loading..."
                }
            />
        </div>
    );
}

const SearchScope = {
    root: "isa/138875005",
    clinicalFinding: "isa/404684003",

    // medicinalProductUnitOfUse: "isa/30450011000036109",
    medicinalProductUnitOfUse: "refset/929360071000036103",

    timePatterns: "isa/272103003",
};

async function searchTerminology(input: string, searchScope: string): Promise<FHIR.ValueSet> {
    const serverBaseUrl = "https://r4.ontoserver.csiro.au/fhir/";
    const codeSystemUrl = `http://snomed.info/sct?fhir_vs=${searchScope}`;

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
function parseDoseRange(dose: string): FHIR.Range | null {
    const match = dose.match(/\d+\s*-\d+\s*\w+/)?.[0];
    if (match) {
        const [values, unit] = match.split(" ");
        const [valueLow, valueHigh] = values.split("-").map((s) => s.trim());
        return {
            low: {
                value: parseInt(valueLow, 10),
                unit,
            },
            high: {
                value: parseInt(valueHigh, 10),
                unit,
            },
        };
    } else {
        return null;
    }
}

async function getDosesFor(medication: string): Promise<Set<string>> {
    const vs = await searchTerminology(medication, SearchScope.medicinalProductUnitOfUse);

    const doses = new Set<string>();
    for (const term of vs.expansion?.contains ?? []) {
        const qty = parseDose(term.display);
        if (qty) {
            doses.add(qty.value + " " + qty.unit);
        }
    }

    function sort(doses: Set<string>) {
        function value(str: string) {
            return parseInt(str.split(" ")[0]);
        }
        return new Set([...doses].sort((a, b) => value(a) - value(b)));
    }

    return sort(doses);
}

async function loadOptionsFromTerminology(
    input: string,
    searchScope: string,
    composition: FHIR.Composition
): Promise<Option[]> {
    const log = _log(loadOptionsFromTerminology, arguments);

    if (input.length < minInputLengthForSearch) {
        return [];
    }

    const vs = await searchTerminology(input, searchScope);

    function termToOptions(term: Term): Option[] {
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
                return [new ConditionOption(term, composition)];
            case "substance":
                return [new MedicationOption(term, composition)];
        }
        return [];
    }

    const options = vs.expansion?.contains?.flatMap(termToOptions) ?? [];
    return options;
}

function isError(obj: any): obj is { error: string } {
    return typeof obj["error"] === "string";
}

function isNumeric(str: string) {
    return parseInt(str, 10) + "" == str;
}
function isNumericRange(str: string) {
    return !!str.trim().match(/^\d+\s*-\s*\d+$/);
}

function formatOptionWithCode(option: Option) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>{option.label}</div>
            <div>{option.keyData}</div>
        </div>
    );
}
