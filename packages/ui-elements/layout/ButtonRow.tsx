import React from "react";
import { Stack } from "@fluentui/react";

interface Props {
    children: React.ReactNode;
}
export function ButtonRow(props: Props) {
    return (
        <Stack
            horizontal
            tokens={{ childrenGap: 10 }}
            style={{ marginBottom: "0.5em" }}
        >
            {props.children}
        </Stack>
    );
}
