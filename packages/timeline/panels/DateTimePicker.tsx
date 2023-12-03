import React from "react";

import { Button, Field, Input, InputProps } from "@fluentui/react-components";

import { styles, controlSize } from "./styles";

interface Props {
    onChange: (value: string) => void;
}
export function DateTimePicker(props: Props) {
    const classes = styles();

    const [error, setError] = React.useState("");

    const onChange: InputProps["onChange"] = (ev, { value }) => {
        props.onChange(value);
    };

    return (
        <>
            <div className={classes.horizontal}>
                <Field validationMessage={error}>
                    <div className={classes.horizontal}>
                        <Input
                            size={controlSize}
                            // className={classes.textboxWideWide}
                            type="datetime-local"
                            defaultValue={localTimeISO()}
                            onChange={onChange}
                        />
                        {/* <Button
                            appearance="subtle"
                            size={controlSize}
                        >
                            now
                        </Button> */}
                    </div>
                </Field>
            </div>
        </>
    );
}

export function localTimeISO() {
    let d = new Date();

    // UTC --> local - thanks to https://stackoverflow.com/a/72581185
    d.setTime(d.getTime() - d.getTimezoneOffset() * 60000);

    return d.toISOString().replace(/:[\d\.]+Z$/, "");
}
