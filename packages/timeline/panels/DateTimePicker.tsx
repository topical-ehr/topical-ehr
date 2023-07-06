import React from "react";

import { Button, Field, Input, InputProps } from "@fluentui/react-components";

import { styles, localTimeISO } from "./RecordObsPanel";

export function DateTimePicker(props: {}) {
    const classes = styles();

    const [error, setError] = React.useState("");

    const onChange: InputProps["onChange"] = (ev, { value }) => {};

    return (
        <>
            <label>Time</label>
            <div className={classes.horizontal}>
                <Field validationMessage={error}>
                    <div className={classes.horizontal}>
                        <Input
                            size="small"
                            // className={classes.textboxWideWide}
                            type="datetime-local"
                            defaultValue={localTimeISO()}
                            onChange={onChange}
                        />
                        <Button
                            appearance="subtle"
                            size="small"
                        >
                            now
                        </Button>
                    </div>
                </Field>
            </div>
        </>
    );
}
