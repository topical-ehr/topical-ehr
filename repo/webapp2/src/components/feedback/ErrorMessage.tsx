import { MessageBar, MessageBarType } from "@fluentui/react";

interface Props {
    error?: unknown;
}

export function ErrorMessage({ error }: Props) {
    if (error == null) {
        return null;
    }

    console.error("ErrorMessage", error);

    function makeStringFromError(error: Error) {
        const { message, stack } = error;
        if (stack) {
            return error.message + "\r\n\r\nMore details:\r\n\r\n" + error.stack;
        } else {
            return message;
        }
    }

    function makeString() {
        if (typeof error === "string") {
            return error;
        }

        if (error instanceof Error) {
            return makeStringFromError(error);
        }
        const innerError = (error as any)["error"];
        if (innerError instanceof Error) {
            return makeStringFromError(innerError);
        }

        return JSON.stringify(error);
    }

    return <MessageBar messageBarType={MessageBarType.error}>{makeString()}</MessageBar>;

    return (
        <article className="message is-danger mb-4">
            <div className="message-header">Error</div>

            <div
                className="message-body"
                style={{
                    borderStyle: "none",
                    whiteSpace: "pre",
                }}
            >
                {makeString()}
            </div>
        </article>
    );
}
