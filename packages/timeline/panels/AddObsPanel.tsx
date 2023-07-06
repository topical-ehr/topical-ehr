import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
    makeStyles,
    tokens,
    Input,
    InputProps,
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuItemLink,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Tooltip,
    Field,
} from "@fluentui/react-components";

const styles = makeStyles({
    horizontal: {
        display: "flex",
        columnGap: tokens.spacingHorizontalM,
    },

    textboxNarrow: {
        width: "4em",
    },
    textboxWide: {
        width: "6em",
    },
});

import css from "./AddObsPanel.module.scss";
import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";

interface Props {}

export function AddObsPanel(props: Props) {
    const showing = useFHIR((s) => s.fhir.showingPanels["add-obs"]);
    const dispatch = useAppDispatch();

    function onHide() {
        dispatch(actions.hidePanel("add-obs"));
    }

    if (!showing) {
        return null;
    }

    return (
        <div className={css.panel}>
            <h3>Record obs</h3>
            <ObsForm onCancel={onHide}>
                <BloodPressure />
                <HeartRate />
                <RespiratoryRate />
                <OxygenSaturation />
                <PainScore />
            </ObsForm>
        </div>
    );
}

function ObsForm(props: React.PropsWithChildren & { onCancel?: () => void }) {
    const methods = useForm();
    const onSubmit = (data) => console.log("RHF submit", data);

    const classes = styles();

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <div className={css.grid}>{props.children}</div>

                <div className={classes.horizontal}>
                    <Button
                        appearance="primary"
                        size="small"
                    >
                        Record
                    </Button>
                    <div />
                    <Button
                        appearance="secondary"
                        onClick={props.onCancel}
                        size="small"
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

    const onChange: InputProps["onChange"] = (ev, data) => {
        // The controlled input pattern can be used for other purposes besides validation,
        // but validation is a useful example
        if (data.value.length <= 20) {
            setValue(data.value);
        }
    };

    return (
        <>
            <label>BP</label>
            <div className={classes.horizontal}>
                <Input
                    size="small"
                    className={classes.textboxNarrow}
                />
                /
                <Input
                    size="small"
                    className={classes.textboxNarrow}
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
        <Field validationMessage={error}>
            <Input
                size="small"
                className={props.units ? classes.textboxWide : classes.textboxNarrow}
                contentAfter={props.units}
                onChange={onChange}
            />
        </Field>
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
