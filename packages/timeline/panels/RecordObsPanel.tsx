import { Button, Field, Input, InputProps, makeStyles, mergeClasses, tokens } from "@fluentui/react-components";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import { DateTimePicker } from "./DateTimePicker";
import { styles, controlSize } from "./styles";

import cssPanel from "./Panel.module.scss";
import cssObs from "./RecordObsPanel.module.scss";

interface Props {}

export const RecordObsPanelId = "record-obs";

export function RecordObsPanel(props: Props) {
    const showing = useFHIR((s) => s.fhir.showingPanels[RecordObsPanelId]);
    const dispatch = useAppDispatch();

    function onHide() {
        dispatch(actions.hidePanel(RecordObsPanelId));
    }

    if (!showing) {
        return null;
    }

    return (
        <div className={cssPanel.panel}>
            <h3>Record obs</h3>
            <ObsForm onHide={onHide}>
                <BloodPressure />
                <HeartRate />
                <RespiratoryRate />
                <OxygenSaturation />
                <PainScore />
            </ObsForm>
        </div>
    );
}

function ObsForm(props: React.PropsWithChildren & { onHide?: () => void }) {
    const methods = useForm();
    const onHandleSubmit = (data) => console.log("RHF submit", data);

    const classes = styles();

    function onSubmit() {
        alert("TODO");
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onHandleSubmit)}>
                <div className={cssObs.grid}>
                    <DateTimePicker />
                    {props.children}
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

function BloodPressure() {
    const classes = styles();

    return (
        <>
            <label>BP</label>
            <div className={classes.horizontal}>
                <Input
                    size={controlSize}
                    className={classes.textboxNarrow}
                />
                /
                <Input
                    size={controlSize}
                    className={classes.textboxNarrow}
                />
                <Input
                    size={controlSize}
                    placeholder="comment"
                />
            </div>
        </>
    );
}

function SingleNumber(props: { units?: string; label: string; maxValue: number }) {
    const classes = styles();

    const [error, setError] = React.useState("");

    const onChange: InputProps["onChange"] = (ev, { value }) => {
        if (value.length === 0) {
            setError("");
            return;
        }

        const num = parseInt(value, 10);
        if (isNaN(num)) {
            setError("Not a number");
        } else if (num > props.maxValue) {
            setError("Too big");
        } else {
            setError("");
        }
    };

    return (
        <div className={classes.horizontal}>
            <Field validationMessage={error}>
                <Input
                    size={controlSize}
                    className={props.units ? classes.textboxWide : classes.textboxNarrow}
                    contentAfter={props.units}
                    onChange={onChange}
                />
            </Field>
            <Field>
                <Input
                    size={controlSize}
                    placeholder="comment"
                />
            </Field>
        </div>
    );
}

function SingleObservation(props: { units: string; label: string; maxValue: number }) {
    return (
        <>
            <label>{props.label}</label>
            <SingleNumber {...props} />
        </>
    );
}

function HeartRate() {
    return (
        <SingleObservation
            label="HR"
            units="bpm"
            maxValue={500}
        />
    );
}
function RespiratoryRate() {
    return (
        <SingleObservation
            label="RR"
            units="bpm"
            maxValue={500}
        />
    );
}
function OxygenSaturation() {
    return (
        <SingleObservation
            label="Sp02"
            units="%"
            maxValue={100}
        />
    );
}
function PainScore() {
    return (
        <SingleObservation
            label="Pain"
            units="/10"
            maxValue={20}
        />
    );
}
