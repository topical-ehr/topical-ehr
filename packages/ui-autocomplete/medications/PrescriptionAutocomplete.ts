import * as FHIR from "@topical-ehr/fhir-types";

import { timingCodesAllowed } from "./TimingCodes";
import { BlankOrderState } from "../BlankOrder";
import { AutocompleteStateBase, AutocompleteOptionBase, UpdateResult, InplaceEdit } from "../AutocompleteBase";

import { actions } from "@topical-ehr/fhir-store";
import { logsFor } from "@topical-ehr/logging";

import iconPill from "/icons/pill.svg";
import { Config } from "../AutocompleteConfig";
import {
    getDosesFor,
    formatDose,
    formatDoseRange,
    isNumeric,
    isNumericRange,
    parseDose,
    parseDoseRange,
    throwError,
} from "./prescriptionUtils";

export class PrescriptionAutocompleteState extends AutocompleteStateBase {
    log = logsFor("PrescriptionAutocompleteState");
    icon = iconPill;

    constructor(public readonly MR: FHIR.MedicationRequest, topic: FHIR.Composition, config: Config) {
        super(topic, config);
    }

    doesApply(resource: FHIR.Resource | null): boolean {
        return resource?.resourceType === "MedicationRequest";
    }

    updateTo(next: FHIR.MedicationRequest) {
        return {
            newState: new PrescriptionAutocompleteState(next, this.topic, this.config),
            newActions: [actions.edit(next)],
        };
    }

    getOptions() {
        const options: AutocompleteOptionBase[] = [];

        const { MR } = this;
        const coding = MR.medicationCodeableConcept?.coding?.[0];
        if (coding) {
            options.push(new MedicationOption(coding));
        }

        const dosage = MR.dosageInstruction?.[0];
        const doseAndRate = dosage?.doseAndRate?.[0];
        if (doseAndRate) {
            const { doseQuantity, doseRange } = doseAndRate;

            if (doseQuantity) {
                options.push(new DosageOption(doseQuantity, formatDose(doseQuantity)));
            }
            if (doseRange) {
                options.push(new DosageOption(doseRange, formatDoseRange(doseRange)));
            }
        }

        const timing = dosage?.timing;
        if (timing) {
            options.push(new FrequencyOption(timing.code?.text ?? "(no text)", timing));
        }

        return options;
    }

    async getSuggestedOptions(input: string): Promise<AutocompleteOptionBase[]> {
        const medication = this.MR.medicationCodeableConcept?.text;
        if (!medication) {
            throw new Error("state is missing medication text");
        }

        if (!this.MR.dosageInstruction?.[0].doseAndRate) {
            // need a dose
            // examples
            //   [25 mg] [twice a day]
            //   [5-10 mg] [every 4-6 hours] [PRN]
            //   [10-20 mg] [over 24 hours] [subcut]

            const productDoses = await getDosesFor(medication, this.config);
            this.log.debug("need dose", { productDoses, medication });
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

            const options = [...userEnteredDoses, ...productDoses].map(
                (dose) =>
                    new DosageOption(
                        parseDose(dose) ?? parseDoseRange(dose) ?? throwError("dose could not be parsed"),
                        dose
                    )
            );

            return options;
        }

        if (!this.MR.dosageInstruction?.[0].timing) {
            this.log.debug("need frequency");

            const inputTrimmed = input.trim().toLocaleLowerCase();
            const timings = inputTrimmed
                ? timingCodesAllowed.filter((t) => t.texts.some((s) => s.includes(inputTrimmed)))
                : timingCodesAllowed;

            return timings.map((t) => new FrequencyOption(t.timing.code!.text!, t.timing));
        }

        return [];
    }
}

export class MedicationOption extends AutocompleteOptionBase {
    log = logsFor("MedicationOption");

    constructor(private term: Partial<FHIR.ValueSetCode>, prefix?: string) {
        super((prefix ?? "") + term.display ?? "(no display)", term);
        if (!term.display) {
            this.log.warn("no display for term", { term });
        }
    }

    onAdded(state: AutocompleteStateBase): UpdateResult {
        const { system, code, display } = this.term;
        const next: FHIR.MedicationRequest = {
            ...FHIR.MedicationRequest.new({
                subject: state.topic.subject,
                status: "active",
                intent: "plan",
            }),
            medicationCodeableConcept: {
                text: display,
                coding: [{ system, code, display, userSelected: true }],
            },
        };

        return {
            newState: new PrescriptionAutocompleteState(next, state.topic, state.config),
            newActions: [actions.edit(next), state.addToComposition(next)],
        };
    }

    onRemoved(state: AutocompleteStateBase): UpdateResult {
        if (state instanceof PrescriptionAutocompleteState) {
            return {
                newState: new BlankOrderState(state.topic, state.config),
                newActions: [actions.delete(state.MR), state.removeFromComposition(state.MR)],
            };
        } else {
            throw this.log.exception("unexpected state type", { state });
        }
    }

    inplaceEdit = () => "disallow" as InplaceEdit;
}

function assertState(state: AutocompleteStateBase): asserts state is PrescriptionAutocompleteState {
    if (!(state instanceof PrescriptionAutocompleteState)) {
        throw new Error("unexpected state type");
    }
}

class DosageOption extends AutocompleteOptionBase {
    constructor(private dosage: FHIR.Quantity | FHIR.Range, label: string) {
        super(label, dosage);
    }

    onAdded(state: AutocompleteStateBase): UpdateResult {
        assertState(state);

        function isRange(dosage: any): dosage is FHIR.Range {
            return !!dosage["low"];
        }
        const dosage = this.dosage;
        const prev = state.MR;
        const next: FHIR.MedicationRequest = {
            ...prev,
            dosageInstruction: [
                {
                    ...prev.dosageInstruction?.[0],
                    doseAndRate: [
                        {
                            doseRange: isRange(dosage) ? dosage : undefined,
                            doseQuantity: !isRange(dosage) ? dosage : undefined,
                        },
                    ],
                },
            ],
        };
        return state.updateTo(next);
    }

    onRemoved(state: AutocompleteStateBase): UpdateResult {
        assertState(state);
        const prev = state.MR;
        const next: FHIR.MedicationRequest = {
            ...prev,
            dosageInstruction: [
                {
                    ...prev.dosageInstruction?.[0],
                    doseAndRate: undefined,
                },
            ],
        };
        return state.updateTo(next);
    }

    inplaceEdit = () => "remove-me" as InplaceEdit;
}

class FrequencyOption extends AutocompleteOptionBase {
    constructor(display: string, private timing: FHIR.Timing) {
        super(display, display);
    }

    onAdded(state: AutocompleteStateBase): UpdateResult {
        assertState(state);
        const next: FHIR.MedicationRequest = {
            ...state.MR,
            dosageInstruction: [
                {
                    ...state.MR.dosageInstruction?.[0],
                    timing: this.timing,
                },
            ],
        };
        return state.updateTo(next);
    }

    onRemoved(state: AutocompleteStateBase): UpdateResult {
        assertState(state);
        const next: FHIR.MedicationRequest = {
            ...state.MR,
            dosageInstruction: [
                {
                    ...state.MR.dosageInstruction?.[0],
                    timing: undefined,
                },
            ],
        };
        return state.updateTo(next);
    }

    inplaceEdit = () => "remove-me" as InplaceEdit;
}
