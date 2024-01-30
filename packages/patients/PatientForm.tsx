import produce from "immer";
import * as React from "react";

import {
    Button,
    Field,
    Input,
    InputOnChangeData,
    InputProps,
    Label,
    Select,
    SelectOnChangeData,
    makeStyles,
    shorthands,
    useId,
} from "@fluentui/react-components";

import * as FHIR from "@topical-ehr/fhir-types";
import { ErrorMessage } from "@topical-ehr/ui-elements/ErrorMessage";
import { WritableDraft } from "immer/dist/types/types-external.js";

const useStyles = makeStyles({
    form: {
        ...shorthands.margin("1em", "0"),
    },
    button: {
        ...shorthands.margin("1em", "0"),
    },
    field: {
        ...shorthands.margin("0.5em", "0.25em"),
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        alignItems: "center",
        columnGap: "1em",
    },
    row: {
        display: "flex",
    },
    fields: {
        display: "flex",
        flexDirection: "column",
        ...shorthands.gap("2px"),
        maxWidth: "400px",
    },
});

interface Props {
    existing?: FHIR.Patient;
    onSave(patient: FHIR.Patient): void;
    error?: string;
    isLoading: boolean;
}
export function PatientForm(props: Props) {
    const styles = useStyles();

    const [state, setState] = React.useState(() => {
        const initialState: ReducerState<FHIR.Patient> = {
            resource: props.existing ?? FHIR.Patient.new(),
            sections: [],
        };
        const result = produce(initialState, (draft) =>
            PatientFormReducer(draft, { type: "load" })
        );
        return result;
    });

    function onSubmit() {
        props.onSave(state.resource);
    }

    function onEvent(event: Event) {
        const result = produce(state, (draft) => PatientFormReducer(draft, event));
        console.log("Called form reducer", { event, state, result });
        setState(result);
    }

    const debug = false;

    return (
        <form
            onSubmit={onSubmit}
            className={styles.form}
        >
            <div className={styles.grid}>
                {state.sections.map((section) => (
                    <Section
                        key={section.display}
                        section={section}
                        onEvent={onEvent}
                    />
                ))}
            </div>
            <Button
                className={styles.button}
                appearance="primary"
                type="submit"
                disabled={props.isLoading}
            >
                {props.existing ? "Update" : "Add"}
            </Button>
            <ErrorMessage error={props.error} />
            {debug && <pre>{JSON.stringify(state, null, 4)}</pre>}
        </form>
    );
}

function Section(props: { section: Section; onEvent(event: Event): void }) {
    const { section } = props;
    const styles = useStyles();
    const rows = (section.rows ?? []).concat(section.row ? [section.row] : []);
    return (
        <>
            <div>{section.display}</div>
            <div>
                {rows.map((row, rowIndex) => (
                    <div
                        key={getRowKey(row) ?? ""}
                        className={styles.row}
                    >
                        {row.map((c) => (
                            <FormControl
                                control={c}
                                section={section.section}
                                index={rowIndex}
                                onEvent={props.onEvent}
                                key={c.display}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}

function FormControl(props: {
    control: FormControl;
    section: string;
    index: number;
    onEvent(event: Event): void;
}) {
    const type = props.control.type;
    switch (type) {
        case "text":
            return (
                <TextField
                    {...props.control}
                    {...props}
                />
            );
        case "date":
            return (
                <DateField
                    {...props.control}
                    {...props}
                />
            );
        case "select":
            return (
                <SelectField
                    {...props.control}
                    {...props}
                />
            );
        case "button":
            return (
                <ButtonField
                    {...props.control}
                    {...props}
                />
            );
        case "rowKey":
        case "nothing":
            return null;
    }
    return <ErrorMessage error={`Invalid control: ${type}`} />;
}

function SelectField(props: FormControlProps<SelectProps>) {
    const htmlId = useId("SelectField");
    const styles = useStyles();

    function onChange(_: React.ChangeEvent, data: SelectOnChangeData) {
        props.onEvent({
            ...props,
            type: "edit",
            value: data.value,
        });
    }

    const value = props.value?.toLowerCase();

    return (
        <Field
            validationMessage=""
            className={styles.field}
        >
            <Label htmlFor={htmlId}>{props.display}</Label>
            <Select
                id={htmlId}
                onChange={onChange}
                // value={props.value}
            >
                {props.options.map((opt) => (
                    <option
                        key={opt}
                        selected={opt.toLowerCase() == value}
                    >
                        {opt}
                    </option>
                ))}
            </Select>
        </Field>
    );
}

function ButtonField(props: FormControlProps<ButtonProps>) {
    const htmlId = useId("TextField");
    const styles = useStyles();

    function onClick() {
        props.onEvent({
            ...props,
            type: "click",
        });
    }

    return (
        <>
            <Button
                onClick={onClick}
                icon={props.display}
                shape="rounded"
                appearance="subtle"
                title={props.tooltip}
            ></Button>
        </>
    );
}

function TextField(props: FormControlProps<TextProps>) {
    const htmlId = useId("TextField");
    const styles = useStyles();

    function onChange(_: React.ChangeEvent, data: InputOnChangeData) {
        props.onEvent({
            ...props,
            type: "edit",
            value: data.value,
        });
    }

    return (
        <Field
            validationMessage=""
            className={styles.field}
        >
            <Label htmlFor={htmlId}>{props.display}</Label>
            <Input
                id={htmlId}
                onChange={onChange}
                value={props.value ?? ""}
                style={{ width: props.width }}
            />
        </Field>
    );
}

function DateField(props: FormControlProps<DateProps>) {
    const styles = useStyles();
    const htmlId = useId("DateField");

    // Input type date seems to work better than the DatePicker!

    // function formatDate(date?: Date): string {
    //     return date ? date.toLocaleDateString() : "";
    // }
    // function onSelectDate(date?: Date | null) {
    //     props.onEvent({
    //         ...props,
    //         type: "edit",
    //         value: date?.toString() ?? "",
    //     });
    // }

    const onChange: InputProps["onChange"] = (ev, { value }) => {
        props.onEvent({
            ...props,
            type: "edit",
            value,
        });
    };

    return (
        <Field
            validationMessage={""}
            className={styles.field}
        >
            <Label htmlFor={htmlId}>{props.display}</Label>
            <Input
                type="date"
                value={props.value?.toString()}
                onChange={onChange}
            />
            {/* <DatePicker
                allowTextInput
                value={props.value ? new Date(props.value) : new Date()}
                onSelectDate={onSelectDate}
                formatDate={formatDate}
                // parseDateFromString={onParseDateFromString}
                placeholder=""
                openOnClick={false}
            /> */}
        </Field>
    );
}

interface EditEvent {
    type: "edit";
    section: string;
    index: number;
    field: string;
    value: string;
}

interface ClickEvent {
    type: "click";
    section: string;
    index: number;
    name: string;
}

type Event = { type: "load" } | ClickEvent | EditEvent;

interface CommonProps {
    display: string;
    field: string;
    value?: string;
}

interface DateProps extends CommonProps {
    type: "date";
}
interface TextProps extends CommonProps {
    type: "text";
    width?: string;
}

interface SelectProps extends CommonProps {
    type: "select";
    options: string[];
}

interface ButtonProps {
    type: "button";
    display: string;
    name: string;
    tooltip: string;
}
interface NothingProps {
    type: "nothing";
    display: "nothing"; // for the key prop
}

interface RowKeyProps {
    type: "rowKey";
    display: "rowKey"; // for the key prop
    rowKey: string;
}

type FormControl =
    | DateProps
    | TextProps
    | ButtonProps
    | SelectProps
    | RowKeyProps
    | NothingProps;

type FormControlProps<T extends object> = T & {
    section: string;
    index: number;
    onEvent(event: Event): void;
};

function rowKey(rowKey: string): RowKeyProps {
    return { type: "rowKey", display: "rowKey", rowKey };
}
function isRowKey(c: FormControl): c is RowKeyProps {
    return c.type === "rowKey";
}
function getRowKey(row: FormControl[]) {
    return row.find(isRowKey)?.rowKey;
}
function text(display: string, field: string, value?: string, width?: string): TextProps {
    return { type: "text", display, field, value, width };
}
function date(display: string, field: string, value?: string): DateProps {
    return { type: "date", display, field, value };
}
function button(display: string, name: string, tooltip: string): ButtonProps {
    return { type: "button", display, name, tooltip };
}
function nothing(): NothingProps {
    return { type: "nothing", display: "nothing" };
}
function select(
    display: string,
    options: string[],
    field: string,
    value?: string
): SelectProps {
    return { type: "select", display, options, field, value };
}

interface Section {
    section: string;
    display: string;
    rows?: FormControl[][];
    row?: FormControl[];
}

interface ReducerState<T> {
    resource: T;
    sections: Section[];
}

let nameRowKey = 0;
function nextRowKey() {
    nameRowKey += 1;
    return nameRowKey + "";
}

/** Give each array entry (e.g. patient.name) a key */
function createKeys(obj: object) {
    for (const property of Object.values(obj)) {
        if (Array.isArray(property)) {
            property.forEach((elt) => {
                elt.__key = nextRowKey();
            });
        }
    }
}

function PatientFormReducer(
    state: WritableDraft<ReducerState<FHIR.Patient>>,
    event: Event
): void {
    const patient = state.resource;

    switch (event.type) {
        case "load":
            // give each name a key
            createKeys(patient);
            break;
        case "edit": {
            const { section, index, field, value } = event;
            switch (section) {
                case "name":
                    const name = patient?.[section]?.[index];
                    if (name) {
                        switch (field) {
                            case "use":
                                name.use = value.toLowerCase() as (typeof name)["use"];
                                break;
                            case "prefix":
                                name.prefix = [value];
                                break;
                            case "given":
                                name.given = [value];
                                break;
                            case "family":
                                name.family = value;
                                break;
                        }
                    }
                    break;
                case "gender":
                    patient.gender = value as any;
                    break;
                case "dob":
                    patient.birthDate = value;
                    break;
            }
            break;
        }
        case "click":
            const { section, index, name } = event;
            switch (section) {
                case "name":
                    switch (event.name) {
                        case "delete":
                            patient.name = (patient.name ?? []).splice(index, 1);
                            break;
                        case "add":
                            patient.name = [
                                ...(patient.name ?? []),
                                { __key: nextRowKey() },
                            ];
                            break;
                    }
            }
    }

    state.sections = [
        {
            section: "name",
            display: "Name(s)",
            rows: (patient.name ?? [{}])
                .map((name) => [
                    rowKey(name.__key ?? "no key!?"),
                    select(
                        "Type",
                        ["Usual", "Maiden", "Official", "Nickname", "Old"],
                        "use",
                        name.use || "Usual"
                    ),
                    text("Title", "prefix", name.prefix?.[0], "5em"),
                    text("First name", "given", name.given?.[0], "10em"),
                    text("Last name", "family", name.family, "10em"),
                    (patient.name?.length ?? 0) > 1
                        ? button("🗑️", "delete", "delete this name")
                        : nothing(),
                ])
                .concat([[button("+", "add", "add another name"), rowKey("+")]]),
        },
        {
            section: "address",
            display: "Address(es)",
            rows: (patient.address ?? [{}])
                .map((address) => [
                    rowKey(address.__key ?? "no key!?"),
                    select(
                        "Type",
                        ["Home", "Work", "Temp", "Old"],
                        "use",
                        address.use || "Home"
                    ),
                    text("Street", "line", address.line?.[0], "15em"),
                    text("City", "city", address.city, "10em"),
                    text("Postcode", "postcode", address.postalCode, "5em"),
                    (patient.address?.length ?? 0) > 1
                        ? button("🗑️", "delete", "delete this address")
                        : nothing(),
                ])
                .concat([[button("+", "add", "add another address"), rowKey("+")]]),
        },
        {
            section: "telecom",
            display: "Contacts",
            rows: [
                [
                    rowKey("phone"),
                    text(
                        "Phone",
                        "phone",
                        patient.telecom?.find((cp) => cp.system === "phone")?.value,
                        "10em"
                    ),
                    text(
                        "Email",
                        "email",
                        patient.telecom?.find((cp) => cp.system === "email")?.value,
                        "10em"
                    ),
                ],
            ],
        },
        {
            section: "gender",
            display: "Gender",
            row: [
                select("", ["male", "female", "other"], "gender", patient.gender),
                rowKey("gender"),
            ],
        },
        {
            section: "dob",
            display: "Birth Date",
            row: [date("", "birthDate", patient.birthDate)],
        },
    ];
}
