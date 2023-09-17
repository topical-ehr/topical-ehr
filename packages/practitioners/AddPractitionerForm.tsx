import * as React from "react";
import { makeStyles, shorthands, useId, Input, Label, Button, Field } from "@fluentui/react-components";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import * as FHIR from "@topical-ehr/fhir-types";
import { useAddPractitionerMutation } from "@topical-ehr/fhir-store/practitioner-slice";
import { ErrorMessage } from "@topical-ehr/ui-elements/ErrorMessage";

const useStyles = makeStyles({
    form: {
        ...shorthands.margin("1em", "0"),
    },
    button: {
        ...shorthands.margin("1em", "0"),
    },
    field: {
        ...shorthands.margin("0.5em", "0"),
    },
    fields: {
        display: "flex",
        flexDirection: "column",
        // Use 2px gap below the label (per the design system)
        ...shorthands.gap("2px"),
        // Prevent the example from taking the full width of the page (optional)
        maxWidth: "400px",
    },
});

interface FormValues {
    "First name": string;
    "Last name": string;
    Role: string;
}

interface Props {
    onAdded(): void;
}
export function AddPractitionerForm(props: Props) {
    const styles = useStyles();

    const methods = useForm<FormValues>();

    const [addPractitioner, result] = useAddPractitionerMutation();

    function onSubmit(data: FormValues) {
        console.log("onSubmit", data);

        addPractitioner({
            practitioner: {
                resourceType: "Practitioner",
                name: [{ family: data["Last name"], given: data["First name"] }],
                ...FHIR.newMeta(),
            },
            role: {
                resourceType: "PractitionerRole",
                code: [{ text: data.Role }],
                ...FHIR.newMeta(),
            },
        })
            .unwrap()
            .then(() => {
                props.onAdded();
            });
    }

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className={styles.form}
            >
                <div className={styles.fields}>
                    <TextField field="First name" />
                    <TextField field="Last name" />
                    <TextField field="Role" />
                </div>
                <Button
                    className={styles.button}
                    appearance="primary"
                    type="submit"
                    disabled={result.isLoading}
                >
                    Add
                </Button>
                {result.isError && <ErrorMessage error={result.error} />}
            </form>
        </FormProvider>
    );
}

function TextField(props: { field: keyof FormValues }) {
    const methods = useFormContext<FormValues>();

    const htmlId = useId("add-practitioner-");
    const styles = useStyles();
    return (
        <Field
            validationMessage={methods.formState.errors?.[props.field]?.message}
            className={styles.field}
        >
            <Label htmlFor={htmlId}>{props.field}</Label>
            <Input
                id={htmlId}
                {...methods.register(props.field, { required: "Please enter the " + props.field.toLowerCase() })}
            />
        </Field>
    );
}
