import React from "react";
import { SelectProps, makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { Select } from "@fluentui/react-components";
import { Dropdown, DropdownProps, Option } from "@fluentui/react-components";
import { Input, InputProps } from "@fluentui/react-components";
import { Button } from "@fluentui/react-components";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import "./monacoWorkers";
interface Props {}

const styles = makeStyles({
    grid: {
        display: "grid",
        gridTemplateColumns: "auto 8em 1fr",
        ...shorthands.gap(tokens.spacingHorizontalM),
        alignItems: "center",
    },
    editor: {
        gridColumnEnd: "span 2",
        height: "50vh",
        ...shorthands.border("1px", "solid", "gray"),
    },
});

export function FhirEditor(props: Props) {
    const [editor, setEditor] = React.useState<monaco.editor.IStandaloneCodeEditor | null>(null);

    // editorCell enables editor to be used in monaco callbacks (editor itself is captured as null)
    const editorCell = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const monacoEl = React.useRef(null);

    React.useEffect(() => {
        if (monacoEl) {
            setEditor((editor) => {
                if (editor) return editor;

                const gotoFhirReferenceCommand = monaco.editor.addCommand({
                    id: "gotoFhirReference",
                    async run(_, reference) {
                        setFhirUrl(reference);
                        await loadUrl(reference);
                    },
                });

                monaco.languages.registerHoverProvider("json", {
                    async provideHover(model, position, token) {
                        const word = model.getWordAtPosition(position);
                        if (!word) {
                            return;
                        }
                        console.log({ word });

                        const line = model.getLineContent(position.lineNumber);
                        if (!line.includes(`"reference":`)) {
                            return;
                        }

                        const reference = word.word;
                        if (!reference.match(/^[A-Z][a-z]+\/\w+$/)) {
                            return;
                        }

                        // fetch preview from FHIR server
                        const url = serverUrl + "/" + reference;
                        const response = await fetch(url);
                        let json = await response.text();

                        const encodedArgs = encodeURIComponent(JSON.stringify(reference));

                        return {
                            range: new monaco.Range(
                                position.lineNumber,
                                word.startColumn,
                                position.lineNumber,
                                word.endColumn
                            ),
                            contents: [
                                { value: `**${reference}**` },
                                {
                                    value: "```json\n" + formatJson(json) + "\n```",
                                },
                                {
                                    isTrusted: true,
                                    value: `[Go to ${reference}](command:gotoFhirReference?${encodedArgs})`,
                                },
                            ],
                        };
                    },
                });

                const newEditor = monaco.editor.create(monacoEl.current!, {
                    value: JSON.stringify({ key: "value" }, null, 4),
                    language: "application/json",
                });

                return newEditor;
            });
        }

        return () => editor?.dispose();
    }, [monacoEl.current]);

    React.useEffect(() => {
        editorCell.current = editor;
    }, [editor]);

    const [serverType, setServerType] = React.useState("GET");
    const onServerTypeChanged: SelectProps["onChange"] = (event, data) => {
        setServerType(data.value);
    };

    const [serverUrl, setServerUrl] = React.useState("/fhir");
    const onServerUrlChanged: InputProps["onChange"] = (event, data) => {
        setServerUrl(data.value);
    };

    const [method, setMethod] = React.useState("GET");
    const onMethodChanged: SelectProps["onChange"] = (event, data) => {
        setMethod(data.value);
    };

    const [fhirUrl, setFhirUrl] = React.useState("Condition");
    const onFhirUrlChanged: InputProps["onChange"] = (event, data) => {
        setFhirUrl(data.value.replace(/^\/+/, ""));
    };

    async function loadUrl(fhirUrl: string) {
        const url = serverUrl + "/" + fhirUrl;
        const response = await fetch(url, {
            method,
        });

        const json = await response.text();

        const model = monaco.editor.createModel(formatJson(json), "json");
        editorCell?.current?.setModel(model);
    }

    const onSend = async () => {
        await loadUrl(fhirUrl);
    };

    const classes = styles();

    return (
        <div className={classes.grid}>
            <label>Server</label>
            <Select
                value={serverType}
                onChange={onServerTypeChanged}
            >
                <option value="HTTP">HTTP</option>
                <option value="Browser">Browser</option>
            </Select>
            <Input
                value={serverUrl}
                onChange={onServerUrlChanged}
            ></Input>

            <label>Request</label>
            <Select
                value={method}
                onChange={onMethodChanged}
            >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
            </Select>
            <Input
                contentBefore={"/"}
                value={fhirUrl}
                onChange={onFhirUrlChanged}
            ></Input>

            <label></label>
            <Button
                appearance="primary"
                onClick={onSend}
            >
                Send
            </Button>
            <div></div>

            <label></label>
            <div
                className={classes.editor}
                ref={monacoEl}
            ></div>
        </div>
    );
}

function formatJson(json: string) {
    try {
        return JSON.stringify(JSON.parse(json), null, 4);
    } catch {
        return json;
    }
}
