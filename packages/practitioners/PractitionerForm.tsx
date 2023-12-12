import * as React from "react";
import { makeStyles, shorthands, useId, Input, Label, Button, Field } from "@fluentui/react-components";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import * as FHIR from "@topical-ehr/fhir-types";
import {
    PractitionerWithRole,
    useAddPractitionerMutation,
    useUpdatePractitionerMutation,
} from "@topical-ehr/fhir-store/practitioner-slice";
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

interface PractitionerFormValues {
    "First name": string;
    "Last name": string;
    Role: string;
}

interface Props {
    existing?: PractitionerWithRole;
    onSubmitted(): void;
}
export function PractitionerForm(props: Props) {
    const styles = useStyles();

    const methods = useForm<PractitionerFormValues>({
        defaultValues: {
            "First name": props?.existing?.practitioner?.name?.[0]?.given,
            "Last name": props?.existing?.practitioner?.name?.[0]?.family,
            Role: props?.existing?.role?.code?.[0]?.text,
        },
    });

    const [addPractitioner, resultAdd] = useAddPractitionerMutation();
    const [updatePractitioner, resultUpdate] = useUpdatePractitionerMutation();

    function onSubmit(data: PractitionerFormValues) {
        const newResoure: PractitionerWithRole = {
            practitioner: {
                resourceType: "Practitioner",
                ...(props.existing?.practitioner ?? FHIR.newMeta()),
                name: [{ family: data["Last name"], given: data["First name"] }],
            },
            role: {
                resourceType: "PractitionerRole",
                ...(props.existing?.role ?? FHIR.newMeta()),
                code: [{ text: data.Role }],
            },
        };

        const mutation = props.existing ? updatePractitioner : addPractitioner;
        console.log("onSubmit", { data, existing: props.existing, mutation });

        mutation(newResoure)
            .unwrap()
            .then(() => {
                props.onSubmitted();
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
                    disabled={resultAdd.isLoading || resultUpdate.isLoading}
                >
                    {props.existing ? "Update" : "Add"}
                </Button>
                <ErrorMessage error={resultAdd.error ?? resultUpdate.error} />
            </form>
        </FormProvider>
    );
}

function TextField(props: { field: keyof PractitionerFormValues }) {
    const methods = useFormContext<PractitionerFormValues>();

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
