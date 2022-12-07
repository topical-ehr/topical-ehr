import { actions } from "../../../redux/FhirState";
import { SearchScope, searchTerminology } from "../../../utils/FhirTerminology";
import * as FHIR from "../../../utils/FhirTypes";
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
                        dose,
                        this
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

            return timings.map((t) => new FrequencyOption(t.timing.code!.text!, t.timing, this));
        }

        return [];
    }
}

export class MedicationOption extends TopicItemOptionBase {
    constructor(
        private term: FHIR.ValueSetCode,
        private state: PrescriptionTopicItemState | BlankTopicItemState
    ) {
        super(term.display, term);
    }

    onAdded(): UpdateResult {
        const { system, code, display } = this.term;
        const next: FHIR.MedicationRequest = {
            ...FHIR.MedicationRequest.new({
                subject: this.state.topic.subject,
                status: "active",
                intent: "plan",
            }),
            medicationCodeableConcept: {
                text: display,
                coding: [{ system, code, display, userSelected: true }],
            },
        };

        return {
            newState: new PrescriptionTopicItemState(next, this.state.topic),
            newActions: [actions.edit(next), this.state.addToComposition(next)],
        };
    }

    onRemoved(): UpdateResult {
        if (this.state instanceof PrescriptionTopicItemState) {
            return {
                newState: new BlankTopicItemState(this.state.topic),
                newActions: [
                    actions.delete(this.state.MR),
                    this.state.removeFromComposition(this.state.MR),
                ],
            };
        } else {
            throw new Error("unexpected state type");
        }
    }
}

class DosageOption extends TopicItemOptionBase {
    constructor(
        private dosage: FHIR.Quantity | FHIR.Range,
        label: string,
        private state: PrescriptionTopicItemState
    ) {
        super(label, dosage);
    }

    onAdded(): UpdateResult {
        function isRange(dosage: any): dosage is FHIR.Range {
            return !!dosage["low"];
        }
        const dosage = this.dosage;
        const prev = this.state.MR;
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
        return this.state.updateTo(next);
    }

    onRemoved(): UpdateResult {
        const prev = this.state.MR;
        const next: FHIR.MedicationRequest = {
            ...prev,
            dosageInstruction: [
                {
                    ...prev.dosageInstruction?.[0],
                    doseAndRate: undefined,
                },
            ],
        };
        return this.state.updateTo(next);
    }
}

class FrequencyOption extends TopicItemOptionBase {
    constructor(
        display: string,
        private timing: FHIR.Timing,
        private state: PrescriptionTopicItemState
    ) {
        super(display, display);
    }

    onAdded(): UpdateResult {
        const next: FHIR.MedicationRequest = {
            ...this.state.MR,
            dosageInstruction: [
                {
                    ...this.state.MR.dosageInstruction?.[0],
                    timing: this.timing,
                },
            ],
        };
        return this.state.updateTo(next);
    }

    onRemoved(): UpdateResult {
        const next: FHIR.MedicationRequest = {
            ...this.state.MR,
            dosageInstruction: [
                {
                    ...this.state.MR.dosageInstruction?.[0],
                    timing: undefined,
                },
            ],
        };
        return this.state.updateTo(next);
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
