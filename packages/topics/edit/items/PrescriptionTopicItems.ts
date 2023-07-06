import * as FHIR from "@topical-ehr/fhir-types";
import { timingCodesAllowed } from "./TimingCodes";
import { BlankTopicItemState } from "./BlankTopicItem";
import { TopicItemStateBase, TopicItemOptionBase, UpdateResult } from "./TopicItemBase";

import { actions } from "@topical-ehr/fhir-store";
import { logsFor } from "@topical-ehr/logging";
import { SearchScope } from "@topical-ehr/terminology/FhirTerminology";

import icon from "/icons/pill.svg";
import { Config } from "../../TopicsConfig";

export class PrescriptionTopicItemState extends TopicItemStateBase {
    log = logsFor("ConditionOption");

    doesApply(resource: FHIR.Resource | null): boolean {
        return resource?.resourceType === "MedicationRequest";
    }

    icon = icon;

    constructor(public readonly MR: FHIR.MedicationRequest, topic: FHIR.Composition, config: Config) {
        super(topic, config);
    }

    updateTo(next: FHIR.MedicationRequest) {
        return {
            newState: new PrescriptionTopicItemState(next, this.topic, this.config),
            newActions: [actions.edit(next)],
        };
    }

    getOptions() {
        const options: TopicItemOptionBase[] = [];

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

    async getSuggestedOptions(input: string): Promise<TopicItemOptionBase[]> {
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

            const productDoses = await this.getDosesFor(medication);
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
            console.debug("need frequency");

            const inputTrimmed = input.trim().toLocaleLowerCase();
            const timings = inputTrimmed
                ? timingCodesAllowed.filter((t) => t.texts.some((s) => s.includes(inputTrimmed)))
                : timingCodesAllowed;

            return timings.map((t) => new FrequencyOption(t.timing.code!.text!, t.timing));
        }

        return [];
    }

    async getDosesFor(medication: string): Promise<Set<string>> {
        const vs = await this.config.searchTerminology(medication, SearchScope.medicinalProductUnitOfUse);

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
}

export class MedicationOption extends TopicItemOptionBase {
    log = logsFor("MedicationOption");

    constructor(private term: Partial<FHIR.ValueSetCode>) {
        super(term.display ?? "(no display)", term);
        if (!term.display) {
            this.log.warn("no display for term", { term });
        }
    }

    onAdded(state: TopicItemStateBase): UpdateResult {
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
            newState: new PrescriptionTopicItemState(next, state.topic, state.config),
            newActions: [actions.edit(next), state.addToComposition(next)],
        };
    }

    onRemoved(state: TopicItemStateBase): UpdateResult {
        const { log } = this;
        if (state instanceof PrescriptionTopicItemState) {
            return {
                newState: new BlankTopicItemState(state.topic, state.config),
                newActions: [actions.delete(state.MR), state.removeFromComposition(state.MR)],
            };
        } else {
            throw log.exception("unexpected state type", { state });
        }
    }
}

function assertState(state: TopicItemStateBase): asserts state is PrescriptionTopicItemState {
    if (!(state instanceof PrescriptionTopicItemState)) {
        throw new Error("unexpected state type");
    }
}

class DosageOption extends TopicItemOptionBase {
    constructor(private dosage: FHIR.Quantity | FHIR.Range, label: string) {
        super(label, dosage);
    }

    onAdded(state: TopicItemStateBase): UpdateResult {
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

    onRemoved(state: TopicItemStateBase): UpdateResult {
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
}

class FrequencyOption extends TopicItemOptionBase {
    constructor(display: string, private timing: FHIR.Timing) {
        super(display, display);
    }

    onAdded(state: TopicItemStateBase): UpdateResult {
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

    onRemoved(state: TopicItemStateBase): UpdateResult {
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
function formatDose(dose: FHIR.Quantity): string {
    return `${dose.value} ${dose.unit}`;
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
function formatDoseRange(dose: FHIR.Range) {
    if (dose.high.unit === dose.low.unit) {
        return `${dose.low.value}-${dose.high.value} ${dose.low.unit}`;
    } else {
        return `${dose.low.value} ${dose.low.unit} - ${dose.high.value} ${dose.high.unit}`;
    }
}

function isNumeric(str: string) {
    return parseInt(str, 10) + "" == str;
}
function isNumericRange(str: string) {
    return !!str.trim().match(/^\d+\s*-\s*\d+$/);
}
function throwError(msg: string): never {
    throw new Error(msg);
}
