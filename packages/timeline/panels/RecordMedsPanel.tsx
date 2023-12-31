import React from "react";
import * as R from "remeda";
import { Button, Checkbox, Input, mergeClasses } from "@fluentui/react-components";

import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import * as FHIR from "@topical-ehr/fhir-types";
import { Codes } from "@topical-ehr/fhir-types/FhirCodes";

import cssPanel from "./Panel.module.scss";
import cssMeds from "./RecordMedsPanel.module.scss";
import { controlSize, styles } from "./styles";
import { DateTimePicker } from "./DateTimePicker";
import { formatDose } from "@topical-ehr/ui-autocomplete/medications/prescriptionUtils";
import { NewAutocompleteEditors } from "@topical-ehr/ui-autocomplete/NewAutocompleteEditors";
import { BlankMedicationAdministrationState } from "@topical-ehr/ui-autocomplete/BlankMedicationAdministration";
import { useAutocompleteConfig } from "@topical-ehr/ui-autocomplete/AutocompleteConfig";

interface Props {}

export const RecordMedsPanelId = "record-meds";

export function RecordMedsPanel(props: Props) {
    const showing = useFHIR((s) => s.fhir.showingPanels[RecordMedsPanelId]);
    const dispatch = useAppDispatch();

    function onHide() {
        dispatch(actions.hidePanel(RecordMedsPanelId));
    }

    if (!showing) {
        return null;
    }

    return (
        <div className={cssPanel.panel}>
            <h3>Record medications</h3>
            <MedsForm onHide={onHide}></MedsForm>
        </div>
    );
}

function MedsForm(props: React.PropsWithChildren & { onHide: () => void }) {
    const dispatch = useAppDispatch();

    const patientId = useFHIR((s) => s.fhir.patientId);
    function makeNewComposition() {
        const now = new Date().toISOString();
        return FHIR.Composition.new({
            subject: { reference: `Patient/${patientId}` },
            status: "preliminary",
            type: Codes.Composition.Type.AdministeredMedications,
            date: now,
            title: "Medications Administered",
            section: [{}],
        });
    }
    const [newComposition] = React.useState(makeNewComposition);
    const [date, setDate] = React.useState<string>(() => new Date().toISOString());

    const composition = useFHIR((s) => s.fhir.resourcesWithEdits.compositions[newComposition.id]) ?? newComposition;
    const records = useFHIR((s) => s.fhir.resourcesWithEdits.medicationAdministrations);

    const prescriptions = useFHIR((s) => s.fhir.resourcesWithEdits.medicationRequests);
    const now = new Date();
    const prescribed = React.useMemo(() => {
        return R.pipe(
            Object.values(prescriptions),
            R.filter((prescription) => prescription.status === "active"),
            R.filter((prescription) => !!prescription.medicationCodeableConcept),
            R.uniqBy((prescription) => prescription.medicationCodeableConcept?.text),
            R.sortBy((prescription) => prescription?.medicationCodeableConcept?.text ?? ""),
            R.map((prescription) => {
                const newRecord = FHIR.MedicationAdministration.new({
                    subject: prescription.subject,
                    status: "completed",
                    dateTime: now,
                });

                const dose = prescription.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity;
                if (!dose || !dose.unit) {
                    return null;
                }

                const value: FHIR.MedicationAdministration = {
                    ...newRecord,
                    medicationCodeableConcept: prescription.medicationCodeableConcept,
                    medicationReference: prescription.medicationReference,
                    dosage: {
                        dose,
                    },
                };
                return value;
            })
        );
    }, [prescriptions]);

    function onSubmit() {
        // update dates
        const next: FHIR.Composition = {
            ...composition,
            date: date,
        };
        dispatch(actions.edit(next));
        debugger;

        const entries = composition.section?.[0]?.entry ?? [];
        for (const entry of entries) {
            // entry.reference is a uuid ref
            if (entry.reference) {
                const record = records[entry.reference];
                const next: FHIR.MedicationAdministration = {
                    ...record,
                    effectiveDateTime: date,
                };
                dispatch(actions.edit(next));
            }
        }

        // save
        dispatch(
            actions.save({
                filter: (r) => r.resourceType === "MedicationAdministration" || FHIR.isSameId(composition, r),
            })
        );
        props.onHide();
    }

    const classes = styles();

    const config = useAutocompleteConfig();
    const blankState = new BlankMedicationAdministrationState(composition, config);

    return (
        <form>
            <div className={cssMeds.datetime_field}>
                <label>Time</label>
                <DateTimePicker onChange={setDate} />
            </div>
            <div className={cssMeds.grid}>
                {prescribed.map((ma) =>
                    ma ? (
                        <PrescribedMedRow
                            key={ma.id}
                            ma={ma}
                            composition={composition}
                        />
                    ) : null
                )}
                <div style={{ gridColumn: "1/3" }}>
                    <NewAutocompleteEditors
                        placeholder="Another medication"
                        initialState={blankState}
                    />
                </div>
            </div>

            <div className={mergeClasses(classes.horizontal, classes.vgap)}>
                <Button
                    appearance="primary"
                    size={controlSize}
                    onClick={onSubmit}
                >
                    Record
                </Button>
                <div />
                <Button
                    appearance="secondary"
                    size={controlSize}
                    onClick={props.onHide}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}

function PrescribedMedRow(props: { ma: FHIR.MedicationAdministration; composition: FHIR.Composition }) {
    const classes = styles();
    const { ma, composition } = props;

    const dose = ma.dosage?.dose;
    const label = ma.medicationCodeableConcept?.text + " " + (dose ? formatDose(dose) : "");

    const dispatch = useAppDispatch();
    function onChange(checked: boolean | "mixed") {
        dispatch((checked ? actions.edit : actions.delete)(ma));
        debugger;

        const updatedComposition = (checked ? FHIR.Composition.addEntry : FHIR.Composition.removeEntry)(
            FHIR.referenceTo(ma),
            composition
        );
        dispatch(actions.edit(updatedComposition));
    }

    return (
        <>
            <Checkbox
                onChange={(ev, data) => onChange(data.checked)}
                labelPosition="before"
                label={label}
                className={classes.alignRight}
            />

            <div></div>
        </>
    );
}
