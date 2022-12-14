import { actions } from "../../../redux/FhirState";
import { SearchScope, searchTerminology } from "../../../utils/FhirTerminology";
import * as FHIR from "../../../utils/FhirTypes";
import { logsFor } from "../../../utils/logger";
import { timingCodesAllowed } from "../../prescriptions/TimingCodes";
import { BlankTopicItemState } from "./BlankTopicItem";
import { TopicItemStateBase, TopicItemOptionBase, UpdateResult } from "./TopicItemBase";

export class PrescriptionTopicItemState extends TopicItemStateBase {
    doesApply(resource: FHIR.Resource | null): boolean {
        return resource?.resourceType === "MedicationRequest";
    }

    constructor(public readonly MR: FHIR.MedicationRequest, topic: FHIR.Composition) {
        super(topic);
    }

    updateTo(next: FHIR.MedicationRequest) {
        return {
            newState: new PrescriptionTopicItemState(next, this.topic),
            newActions: [actions.edit(next)],
        };
    }

    async getOptions(input: string): Promise<TopicItemOptionBase[]> {
        const medication = this.MR.medicationCodeableConcept?.text;
        if (!medication) {
            throw new Error("state is missing medication text");
        }

        if (!this.MR.dosageInstruction?.[0].doseAndRate) {
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
}

export class MedicationOption extends TopicItemOptionBase {
    log = logsFor("MedicationOption");

    constructor(private term: FHIR.ValueSetCode) {
        super(term.display, term);
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
            newState: new PrescriptionTopicItemState(next, state.topic),
            newActions: [actions.edit(next), state.addToComposition(next)],
        };
    }

    onRemoved(state: TopicItemStateBase): UpdateResult {
        const { log } = this;
        if (state instanceof PrescriptionTopicItemState) {
            return {
                newState: new BlankTopicItemState(state.topic),
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

function isNumeric(str: string) {
    return parseInt(str, 10) + "" == str;
}
function isNumericRange(str: string) {
    return !!str.trim().match(/^\d+\s*-\s*\d+$/);
}
