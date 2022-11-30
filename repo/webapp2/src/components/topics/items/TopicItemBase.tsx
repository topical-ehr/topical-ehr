import { AnyAction } from "@reduxjs/toolkit";
import { actions } from "../../../redux/FhirState";
import * as FHIR from "../../../utils/FhirTypes";

type UpdateResult =
    | {
          newState: TopicItemStateBase | null;
          newActions: AnyAction[];
      }
    | { error: string };

export abstract class TopicItemStateBase {
    abstract doesApply(resource: FHIR.Resource | null): boolean;

    abstract getOptions(): Promise<TopicItemOptionBase[]>;

    constructor(public readonly composition: FHIR.Composition) {}

    addToComposition(resource: FHIR.Resource) {
        const updatedComposition = FHIR.Composition.addEntry(
            FHIR.referenceTo(resource),
            this.composition
        );
        return actions.edit(updatedComposition);
    }
    removeFromComposition(resource: FHIR.Resource) {
        const updatedComposition = FHIR.Composition.removeEntry(
            FHIR.referenceTo(resource),
            this.composition
        );
        return actions.edit(updatedComposition);
    }
}

export abstract class TopicItemOptionBase {
    abstract onAdded(): UpdateResult;
    abstract onRemoved(): UpdateResult;

    public readonly key: string;
    public readonly value: TopicItemOptionBase;

    constructor(public readonly label: string, public readonly keyData: any) {
        this.key = JSON.stringify(keyData);
        this.value = this;
    }
}

export class PrescriptionTopicItemState extends TopicItemStateBase {
    doesApply(resource: FHIR.Resource | null): boolean {
        return resource?.resourceType === "MedicationRequest";
    }

    async getOptions(): Promise<TopicItemOptionBase[]> {
        const medication = this.state..medicationCodeableConcept?.text;
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
                ? timingCodesAllowed.filter((t) => t.texts.some((s) => s.includes(inputTrimmed)))
                : timingCodesAllowed;

            return timings.map(
                (t) => new FrequencyOption(t.timing.code!.text!, t.timing, composition)
            );
        }
        return await loadOptionsFromTerminology(input, SearchScope.timePatterns, composition);
    }
}

class MedicationOption extends TopicItemOptionBase {
    constructor(private term: FHIR.ValueSetCode, private state: PrescriptionTopicItemState) {
        super(term.display, term);
    }

    onAdded(): UpdateResult {
        const { system, code, display } = this.term;
        const request: FHIR.MedicationRequest = {
            ...FHIR.MedicationRequest.new({
                subject: this.state.composition.subject,
                status: "active",
                intent: "plan",
            }),
            medicationCodeableConcept: {
                text: display,
                coding: [{ system, code, display, userSelected: true }],
            },
        };

        return {
            newState: { type: "prescription", request },
            newActions: [actions.edit(request), this.state.addToComposition(request)],
        };
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
