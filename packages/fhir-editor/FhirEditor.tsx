import React from "react";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import "./monacoWorkers";

import { SelectProps, Tooltip, makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { Select } from "@fluentui/react-components";
import { Alert } from "@fluentui/react-components/unstable";
import { Input, InputProps } from "@fluentui/react-components";
import { Button } from "@fluentui/react-components";

import { FhirServerConfigData, FhirServerMethods, fhirUp } from "@topical-ehr/fhir-store/fhir-server";

const styles = makeStyles({
    grid: {
        display: "grid",
        gridTemplateColumns: "auto 8em 1fr",
        ...shorthands.gap(tokens.spacingHorizontalM),
        alignItems: "center",
    },
    hButtons: {
        "& button": {
            marginRight: tokens.spacingHorizontalM,
        },
    },
    twoColumns: {
        gridColumnEnd: "span 2",
    },
    alignDefault: {
        alignSelf: "normal",
    },
    editor: {
        gridColumnEnd: "span 2",
        height: "50vh",
        ...shorthands.border("1px", "solid", "gray"),
    },
});

interface Props {
    config: FhirServerConfigData;
}

export function FhirEditor(props: Props) {
    const [loadedServer, setLoadedServer] = React.useState<FhirServerMethods | null>(null);
    React.useEffect(() => {
        async function init() {
            const server = await fhirUp(props.config);
            setLoadedServer(server);
        }
        init();
    }, [props.config]);

    if (loadedServer) {
        return <FhirEditorWithServer server={loadedServer} />;
    } else {
        return <div>Loading...</div>;
    }
}

export function FhirEditorWithServer({ server }: { server: FhirServerMethods }) {
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
                        await sendRequest(reference);
                    },
                });

                monaco.languages.registerHoverProvider("json", {
                    async provideHover(model, position, token) {
                        const word = model.getWordAtPosition(position);
                        if (!word) {
                            return;
                        }

                        const line = model.getLineContent(position.lineNumber);
                        if (!line.match(/"(reference|fullUrl)":/)) {
                            return;
                        }

                        const reference = word.word;
                        console.log({ before: reference });
                        if (!reference.match(/^[A-Z][A-Za-z]+\/\w+$/)) {
                            return;
                        }
                        console.log({ reference });

                        // fetch preview from FHIR server
                        const response = await server.doRequest("GET", reference);
                        let json = response.json;

                        const encodedArgs = encodeURIComponent(JSON.stringify(reference));
                        const commandLink = `command:gotoFhirReference?${encodedArgs}`;

                        return {
                            range: new monaco.Range(
                                position.lineNumber,
                                word.startColumn,
                                position.lineNumber,
                                word.endColumn
                            ),
                            contents: [
                                { isTrusted: true, value: `**[${reference}](${commandLink})**` },
                                {
                                    value: "```json\n" + formatJson(json) + "\n```",
                                },
                                {
                                    isTrusted: true,
                                    value: `[Go to ${reference}](${commandLink})`,
                                },
                            ],
                        };
                    },
                });

                const newEditor = monaco.editor.create(monacoEl.current!, {
                    value: "", //JSON.stringify({}, null, 4),
                    language: "application/json",
                    minimap: { enabled: false },
                });

                return newEditor;
            });
        }

        return () => editor?.dispose();
    }, [monacoEl.current]);

    React.useEffect(() => {
        editorCell.current = editor;
    }, [editor]);

    const urlParams = new URLSearchParams(window.location.search);
    // broken in prod builds...:
    // const [urlParams, setUrlParams] = useSearchParams();

    const [method, setMethod] = React.useState("GET");
    const onMethodChanged: SelectProps["onChange"] = (event, data) => {
        setMethod(data.value);
    };
    const sendJSON = method.match(/POST|PUT/);

    const [fhirUrl, setFhirUrl] = React.useState(urlParams.get("fhirUrl") ?? "/fhir");
    const onFhirUrlChanged: InputProps["onChange"] = (event, data) => {
        setFhirUrl(data.value.replace(/^\/+/, ""));
    };

    const [lastHttpStatus, setLastHttpStatus] = React.useState<number | null>(null);
    const [lastHttpHeaders, setLastHttpHeaders] = React.useState<[string, string][] | null>(null);

    React.useEffect(() => {
        // auto-send when loading (should be a safe GET request)
        const fhirUrl = urlParams.get("fhirUrl");
        if (fhirUrl) {
            sendRequest(fhirUrl);
        }
    }, []);

    async function sendRequest(fhirUrl: string) {
        const url = new URL(window.location.href);
        url.searchParams.set("fhirUrl", fhirUrl);
        history.pushState({ fhirUrl }, "", url);

        function loadIntoEditor(json: string) {
            const model = monaco.editor.createModel(formatJson(json), "json");
            editorCell?.current?.setModel(model);
        }

        try {
            const body = sendJSON ? editorCell?.current?.getValue() : undefined;
            const { json, headers, status } = await server.doRequest(method, fhirUrl, body);

            setLastHttpStatus(status);
            setLastHttpHeaders(headers);

            loadIntoEditor(json);
        } catch (err) {
            setLastHttpStatus(null);
            setLastHttpHeaders(null);
            loadIntoEditor(JSON.stringify({ "network error": err.toString() }));
        }
    }

    const onSend = async () => {
        await sendRequest(fhirUrl);
    };

    async function onLoadSnapshot() {
        if (!server.loadSnapshot || server.config.type !== "candlelite") {
            alert("not supported");
            return;
        }
        await server.loadSnapshot(server.config.initialSnapshotUrl);
    }
    async function onDownload() {
        if (!server.export || server.config.type !== "candlelite") {
            alert("not supported");
            return;
        }

        const array = await server.export();
        const blob = new Blob([array.buffer], { type: "application/x-sqlite3" });
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.href = window.URL.createObjectURL(blob);
        a.download = server.config.filename;
        a.addEventListener("click", function () {
            setTimeout(function () {
                window.URL.revokeObjectURL(a.href);
                a.remove();
            }, 500);
        });
        a.click();
    }
    async function onClear() {
        if (!server.clearAll || server.config.type !== "candlelite") {
            alert("not supported");
            return;
        }
        await server.clearAll();
    }

    const classes = styles();

    return (
        <div className={classes.grid}>
            <label>Server</label>
            <div>{server.config.type}</div>
            <div>
                {server.config.type === "candlelite" && (
                    <div className={classes.hButtons}>
                        <Tooltip
                            content={"Reset from " + server.config.initialSnapshotUrl}
                            relationship="label"
                        >
                            <Button onClick={onLoadSnapshot}>Reset DB</Button>
                        </Tooltip>
                        <Button onClick={onDownload}>Download DB</Button>
                        <Button onClick={onClear}>Clear</Button>
                    </div>
                )}
            </div>

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
                {sendJSON ? "Send JSON" : "Send"}
            </Button>
            <div />

            {lastHttpStatus && lastHttpStatus != 200 && (
                <>
                    <label></label>
                    <Alert
                        intent={lastHttpStatus >= 300 ? "error" : "success"}
                        className={classes.twoColumns}
                    >
                        HTTP {lastHttpStatus}
                    </Alert>
                </>
            )}

            <label className={classes.alignDefault}>JSON</label>
            <div
                className={classes.editor}
                ref={monacoEl}
            ></div>

            <label></label>
            <div className={classes.twoColumns}>
                <Tip text="Hover over a FHIR reference to see a preview" />
            </div>

            {lastHttpHeaders && (
                <>
                    <label className={classes.alignDefault}>Headers</label>
                    <div className={classes.twoColumns}>
                        {[...lastHttpHeaders].map(([name, value]) => (
                            <div key={name + value}>
                                <b>{name}</b>: {value}
                            </div>
                        ))}
                    </div>
                </>
            )}
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

/** Like React.useState but persists values in localStorage */
function useStateFromStorage(_key: string, initial: string) {
    // TODO use url history: https://blog.logrocket.com/use-state-url-persist-state-usesearchparams/

    const key = "TopicalEHR.FhirEditor." + _key;
    const [value, setValue] = React.useState(localStorage.getItem(key) ?? initial);

    function wrappedSetter(newValue: string) {
        localStorage.setItem(key, newValue);
        setValue(newValue);
    }

    return [value, wrappedSetter] as [string, typeof wrappedSetter];
}

function Tip(props: { text: string }) {
    return <div>💡Tip: {props.text}</div>;
}
