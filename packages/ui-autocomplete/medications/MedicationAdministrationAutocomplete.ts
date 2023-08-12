import * as FHIR from "@topical-ehr/fhir-types";

import { AutocompleteStateBase, AutocompleteOptionBase, UpdateResult } from "../AutocompleteBase";

import { actions } from "@topical-ehr/fhir-store";
import { logsFor } from "@topical-ehr/logging";

import icon from "/icons/pill.svg";
import { Config } from "../AutocompleteConfig";
import { getDosesFor, formatDose, isNumeric, parseDose, throwError } from "./prescriptionUtils";
import { BlankMedicationAdministrationState } from "../BlankMedicationAdministration";

export class MedicationAdministrationAutocompleteState extends AutocompleteStateBase {
    log = logsFor("MedicationAdministrationAutocompleteState");

    doesApply(resource: FHIR.Resource | null): boolean {
        return resource?.resourceType === "MedicationAdministration";
    }

    icon = icon;

    constructor(public readonly MA: FHIR.MedicationAdministration, topic: FHIR.Composition, config: Config) {
        super(topic, config);
    }

    updateTo(next: FHIR.MedicationAdministration) {
        return {
            newState: new MedicationAdministrationAutocompleteState(next, this.topic, this.config),
            newActions: [actions.edit(next)],
        };
    }

    getOptions() {
        const options: AutocompleteOptionBase[] = [];

        const { MA } = this;
        const coding = MA.medicationCodeableConcept?.coding?.[0];
        if (coding) {
            options.push(new MedicationOption(coding));
        }

        const dosage = MA.dosage;
        if (dosage) {
            const { dose } = dosage;

            if (dose) {
                options.push(new DosageOption(dose, formatDose(dose)));
            }
        }

        return options;
    }

    async getSuggestedOptions(input: string): Promise<AutocompleteOptionBase[]> {
        const medication = this.MA.medicationCodeableConcept?.text;
        if (!medication) {
            throw new Error("state is missing medication text");
        }

        if (!this.MA.dosage?.dose) {
            // need a dose
            // examples
            //   [25 mg] [twice a day]
            //   [5-10 mg] [every 4-6 hours] [PRN]
            //   [10-20 mg] [over 24 hours] [subcut]

            const productDoses = await getDosesFor(medication, this.config);
            this.log.debug("need dose", { productDoses, medication });
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

            const options = [...userEnteredDoses, ...productDoses].map(
                (dose) => new DosageOption(parseDose(dose) ?? throwError("dose could not be parsed"), dose)
            );

            return options;
        }

        return [];
    }
}

export class MedicationOption extends AutocompleteOptionBase {
    log = logsFor("MedicationOption");

    constructor(private term: Partial<FHIR.ValueSetCode>) {
        super(term.display ?? "(no display)", term);
        if (!term.display) {
            this.log.warn("no display for term", { term });
        }
    }

    onAdded(state: AutocompleteStateBase): UpdateResult {
        const { system, code, display } = this.term;
        const next: FHIR.MedicationAdministration = {
            ...FHIR.MedicationAdministration.new({
                subject: state.topic.subject,
                status: "completed",
                dateTime: new Date(), // will be overriden on save
            }),
            medicationCodeableConcept: {
                text: display,
                coding: [{ system, code, display, userSelected: true }],
            },
        };

        return {
            newState: new MedicationAdministrationAutocompleteState(next, state.topic, state.config),
            newActions: [actions.edit(next), state.addToComposition(next)],
        };
    }

    onRemoved(state: AutocompleteStateBase): UpdateResult {
        const { log } = this;
        if (state instanceof MedicationAdministrationAutocompleteState) {
            return {
                newState: new BlankMedicationAdministrationState(state.topic, state.config),
                newActions: [actions.delete(state.MA), state.removeFromComposition(state.MA)],
            };
        } else {
            throw log.exception("unexpected state type", { state });
        }
    }
}

function assertState(state: AutocompleteStateBase): asserts state is MedicationAdministrationAutocompleteState {
    if (!(state instanceof MedicationAdministrationAutocompleteState)) {
        throw new Error("unexpected state type");
    }
}

class DosageOption extends AutocompleteOptionBase {
    constructor(private dosage: FHIR.Quantity, label: string) {
        super(label, dosage);
    }

    onAdded(state: AutocompleteStateBase): UpdateResult {
        assertState(state);

        const dosage = this.dosage;
        const prev = state.MA;
        const next: FHIR.MedicationAdministration = {
            ...prev,
            dosage: {
                ...prev.dosage,
                dose: this.dosage,
            },
        };
        return state.updateTo(next);
    }

    onRemoved(state: AutocompleteStateBase): UpdateResult {
        assertState(state);
        const prev = state.MA;
        const next: FHIR.MedicationAdministration = {
            ...prev,
            dosage: {
                ...prev.dosage,
                dose: undefined,
            },
        };
        return state.updateTo(next);
    }
}
