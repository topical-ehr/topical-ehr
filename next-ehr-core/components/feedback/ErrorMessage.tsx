import { MessageBar, MessageBarType } from "@fluentui/react";

interface Props {
    error?: unknown;
}

export function ErrorMessage({ error }: Props) {
    if (!error) {
        return null;
    } else {
        const asString =
            typeof (error) == "string"
                ? error
                : JSON.stringify(error);

        return (
            <MessageBar
                messageBarType={MessageBarType.error}
            >
                {asString}
            </MessageBar>
        );

    };
}