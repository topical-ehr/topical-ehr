import { Button, Checkbox, Input, mergeClasses } from "@fluentui/react-components";
import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import cssPanel from "./Panel.module.scss";
import cssMeds from "./RecordMedsPanel.module.scss";
import { controlSize, styles } from "./styles";
import { DateTimePicker } from "./DateTimePicker";

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

function MedsForm(props: React.PropsWithChildren & { onHide?: () => void }) {
    const methods = useForm();
    const onHandleSubmit = (data) => console.log("RHF submit", data);

    const classes = styles();

    function onSubmit() {
        alert("TODO");
    }

    const meds = ["Rivaroxaban 5mg evenings", "Nebivolol 10mg evenings"];

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onHandleSubmit)}>
                <div className={cssMeds.datetime_field}>
                    <label>Time</label>
                    <DateTimePicker />
                </div>
                <div className={cssMeds.grid}>
                    {/* <DateTimePicker />
                    <div />
                    <div /> */}

                    {meds.map((med) => (
                        <RecordMedRow
                            key={med}
                            text={med}
                        />
                    ))}
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
                        onClick={props.onHide}
                        size={controlSize}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}

function RecordMedRow(props: { text: string }) {
    const classes = styles();

    return (
        <>
            <Checkbox
                labelPosition="before"
                label={props.text}
                className={classes.alignRight}
            />

            <div></div>
        </>
    );
}
