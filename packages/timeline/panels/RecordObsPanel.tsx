import * as R from "remeda";
import * as FHIR from "@topical-ehr/fhir-types";
import { Codes } from "@topical-ehr/fhir-types/FhirCodes";
import { Button, Field, Input, InputProps, makeStyles, mergeClasses, tokens } from "@fluentui/react-components";
import React from "react";
import { FormProvider, Controller, useForm, ControllerRenderProps, ControllerFieldState } from "react-hook-form";
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

    if (!showing) {
        return null;
    }

    return (
        <div className={cssPanel.panel}>
            <h3>Record obs</h3>
            <ObsForm>
                <BloodPressure />
                <HeartRate />
                <RespiratoryRate />
                <OxygenSaturation />
                <PainScore />
            </ObsForm>
        </div>
    );
}

type FormValues = {
    [key: string]: {
        value: number | string;
        inputInfo: InputInfo;
    };
};
interface InputInfo {
    observationKey: string; // to group components of the same observation (e.g. systolic & diastolic BP, comment inputs)
    observationCode: FHIR.CodeableConcept;
    role:
        | {
              type: "single-quantity";
              unit: Unit;
          }
        | {
              type: "component";
              componentCode: FHIR.CodeableConcept;
              unit: Unit;
          }
        | {
              type: "comment";
          };
}
type Unit = Omit<FHIR.Quantity, "value">;

function ObsForm(props: React.PropsWithChildren) {
    const patientId = useFHIR((s) => s.fhir.patientId);
    const dispatch = useAppDispatch();

    function onHide() {
        dispatch(actions.hidePanel(RecordObsPanelId));
    }

    const methods = useForm<FormValues>();

    const classes = styles();

    function onNewDate(newDate: string) {}

    function onSubmit(data: FormValues) {
        console.log("onSubmit", data);

        const now = new Date().toISOString();

        const observations = R.pipe(
            data,
            R.values,
            R.filter((x) => !!x?.value),
            R.groupBy((x) => x.inputInfo.observationKey),
            R.values,
            R.map((inputs) => {
                const infos = inputs.map((i) => i.inputInfo);

                let ob = FHIR.Observation.new({
                    code: infos[0].observationCode,
                    status: "final",
                    subject: { reference: `Patient/${patientId}` },
                });
                ob.effectiveDateTime = now;

                for (const input of inputs) {
                    switch (input.inputInfo.role.type) {
                        case "single-quantity":
                            ob.valueQuantity = {
                                value: +input.value,
                                ...input.inputInfo.role.unit,
                            };
                            break;

                        case "component":
                            ob.component = ob.component ?? [];
                            ob.component.push({
                                code: input.inputInfo.role.componentCode,
                                valueQuantity: {
                                    value: +input.value,
                                    ...input.inputInfo.role.unit,
                                },
                            });
                            break;

                        case "comment":
                            ob.note = [{ text: input.value + "", time: now }];
                            break;
                    }
                }
                return ob;
            })
        );

        console.log({ observations });
        const ids = new Set(observations.map((o) => o.id));

        // save
        observations.forEach((ob) => dispatch(actions.edit(ob)));
        dispatch(
            actions.save({
                filter: (r) => r.resourceType === "Observation" && ids.has(r.id),
            })
        );
        onHide();
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <div className={cssObs.grid}>
                    <label>Time</label>
                    <DateTimePicker onChange={onNewDate} />
                    {props.children}
                </div>

                <div className={mergeClasses(classes.horizontal, classes.vgap)}>
                    <Button
                        appearance="primary"
                        type="submit"
                        size={controlSize}
                        // onClick={onSubmit}
                    >
                        Record
                    </Button>
                    <div />
                    <Button
                        appearance="secondary"
                        onClick={onHide}
                        size={controlSize}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}

function SingleNumber(props: {
    unit: Unit;
    unitLabel?: string;
    label: string;
    maxValue: number;
    code: FHIR.CodeableConcept;
    component?: string;
    componentCode?: FHIR.CodeableConcept;
}) {
    const { componentCode, unit } = props;
    return (
        <Controller
            name={`${props.label}-${props.component ?? ""}-value` as string}
            defaultValue={null}
            rules={{
                validate: {
                    number: (v) => v == null || !isNaN(v.value) || "Not a number",
                    tooBig: (v) => !(v?.value > props.maxValue) || "Too big",
                },
            }}
            render={(formProps) => (
                <SingleNumbersInput
                    inputInfo={{
                        observationKey: props.label,
                        observationCode: props.code,
                        role: componentCode
                            ? { type: "component", componentCode, unit }
                            : { type: "single-quantity", unit },
                    }}
                    unitLabel={props.unitLabel}
                    field={formProps.field}
                    fieldState={formProps.fieldState}
                />
            )}
        />
    );
}

function SingleNumbersInput(props: {
    inputInfo: InputInfo;
    unitLabel?: string;
    field: ControllerRenderProps;
    fieldState: ControllerFieldState;
}) {
    const classes = styles();

    const onChange: InputProps["onChange"] = (ev, { value: text }) => {
        const value = text.length === 0 ? null : parseInt(text, 10);
        const { inputInfo } = props;
        props.field.onChange({ value, inputInfo });
    };

    return (
        <Field validationMessage={props.fieldState.error?.message}>
            <Input
                size={controlSize}
                className={props.unitLabel ? classes.textboxWide : classes.textboxNarrow}
                contentAfter={props.unitLabel}
                onChange={onChange}
            />
        </Field>
    );
}

function Comment(props: { label: string; code: FHIR.CodeableConcept }) {
    const { watch } = useForm();
    function dbg(x) {
        debugger;
        return x;
    }
    return (
        <Controller
            name={props.label + "-comment"}
            defaultValue={null}
            rules={{
                validate: {
                    // hasValue: (v) => !v?.value || !!dbg(watch(props.label + "-value")) || "no value",
                },
            }}
            render={(formProps) => (
                <CommentInput
                    inputInfo={{
                        observationKey: props.label,
                        observationCode: props.code,
                        role: { type: "comment" },
                    }}
                    field={formProps.field}
                    fieldState={formProps.fieldState}
                />
            )}
        />
    );
}

function CommentInput(props: { inputInfo: InputInfo; field: ControllerRenderProps; fieldState: ControllerFieldState }) {
    const onChange: InputProps["onChange"] = (ev, { value }) => {
        const { inputInfo } = props;
        props.field.onChange({ value, inputInfo });
    };

    return (
        <Field validationMessage={props.fieldState.error?.message}>
            <Input
                size={controlSize}
                placeholder="comment"
                onChange={onChange}
            />
        </Field>
    );
}

function SingleObservation(props: {
    unit: Unit;
    unitLabel: string;
    label: string;
    maxValue: number;
    code: FHIR.CodeableConcept;
}) {
    const classes = styles();
    return (
        <>
            <label>{props.label}</label>
            <div className={classes.horizontal}>
                <SingleNumber {...props} />
                <Comment {...props} />
            </div>
        </>
    );
}

function BloodPressure() {
    const classes = styles();

    const props = {
        label: "BP",
        code: Codes.Observation.BloodPressure.Panel,
        unit: Codes.Observation.BloodPressure.Unit,
        maxValue: 400,
    };

    return (
        <>
            <label>BP</label>
            <div className={classes.horizontal}>
                <SingleNumber
                    {...props}
                    component="systolic"
                    componentCode={Codes.Observation.BloodPressure.Systolic}
                />
                /
                <SingleNumber
                    {...props}
                    component="diastolic"
                    componentCode={Codes.Observation.BloodPressure.Diastolic}
                />
                <Comment {...props} />
            </div>
        </>
    );
}

function HeartRate() {
    return (
        <SingleObservation
            label="HR"
            code={Codes.Observation.HeartRate.Code}
            unit={Codes.Observation.HeartRate.Unit}
            unitLabel="bpm"
            maxValue={500}
        />
    );
}
function RespiratoryRate() {
    return (
        <SingleObservation
            label="RR"
            code={Codes.Observation.RespiratoryRate.Code}
            unit={Codes.Observation.RespiratoryRate.Unit}
            unitLabel="bpm"
            maxValue={500}
        />
    );
}
function OxygenSaturation() {
    return (
        <SingleObservation
            label="Sp02"
            code={Codes.Observation.SPO2.Code}
            unit={Codes.Observation.SPO2.Unit}
            unitLabel="%"
            maxValue={100}
        />
    );
}
function PainScore() {
    return (
        <SingleObservation
            label="Pain"
            code={Codes.Observation.Pain.Code}
            unit={Codes.Observation.Pain.Unit}
            unitLabel="/10"
            maxValue={20}
        />
    );
}
