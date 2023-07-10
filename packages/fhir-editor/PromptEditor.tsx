import React from "react";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "./monacoWorkers";

import { SelectProps, Textarea, TextareaProps, makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { Select } from "@fluentui/react-components";
import { Alert } from "@fluentui/react-components/unstable";
import { Input, InputProps } from "@fluentui/react-components";
import { Button } from "@fluentui/react-components";

const styles = makeStyles({
    grid: {
        display: "grid",
        gridTemplateColumns: "auto 1fr",
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
    apiUrl: string;
}

export function PromptEditor(props: Props) {
    const [editor, setEditor] = React.useState<monaco.editor.IStandaloneCodeEditor | null>(null);

    // editorCell enables editor to be used in monaco callbacks (editor itself is captured as null)
    const editorCell = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const monacoEl = React.useRef(null);

    React.useEffect(() => {
        if (monacoEl) {
            setEditor((editor) => {
                if (editor) return editor;

                const newEditor = monaco.editor.create(monacoEl.current!, {
                    value: "",
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

    const [busy, setBusy] = React.useState(false);

    const [model, setModel] = React.useState(urlParams.get("mode") ?? "gpt-4");
    const onModelChanged: SelectProps["onChange"] = (event, data) => {
        setModel(data.value);
    };

    const [userPrompt, setUserPrompt] = React.useState(urlParams.get("userPrompt") ?? "You are a medical assistant");
    const onUserPromptChanged: TextareaProps["onChange"] = (event, data) => {
        setUserPrompt(data.value.replace(/^\/+/, ""));
    };

    const [systemPrompt, setSystemPrompt] = React.useState(urlParams.get("systemPrompt") ?? "Hello");
    const onSystemPromptChanged: TextareaProps["onChange"] = (event, data) => {
        setSystemPrompt(data.value.replace(/^\/+/, ""));
    };

    const [lastHttpStatus, setLastHttpStatus] = React.useState<number | null>(null);

    async function sendRequest(userPrompt: string) {
        const url = new URL(window.location.href);
        url.searchParams.set("model", model);
        url.searchParams.set("userPrompt", userPrompt);
        url.searchParams.set("systemPrompt", systemPrompt);
        history.pushState({}, "", url);

        function loadIntoEditor(json: string) {
            const model = monaco.editor.createModel(formatJson(json), "json");
            editorCell?.current?.setModel(model);
        }

        try {
            const payload = {
                model,
                temperature: 0,
                systemPrompt,
                userPrompt,
            };
            setBusy(true);
            const response = await fetch(props.apiUrl, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "content-type": "application/json",
                },
            });

            setLastHttpStatus(response.status);

            let json = await response.text();

            try {
                const jsonObj = JSON.parse(json);
                const jsonStringFromAI = jsonObj.completion.choices[0].message.content;
                const replyFromAI = JSON.parse(jsonStringFromAI);
                jsonObj.replyFromAI = replyFromAI;
                json = JSON.stringify(jsonObj);
            } catch {}

            loadIntoEditor(json);
        } catch (err) {
            setLastHttpStatus(null);
            loadIntoEditor(JSON.stringify({ "network error": err.toString() }));
        } finally {
            setBusy(false);
        }
    }

    const onSend = async () => {
        await sendRequest(userPrompt);
    };

    const classes = styles();

    return (
        <div className={classes.grid}>
            <label>Model</label>
            <Select
                value={model}
                onChange={onModelChanged}
            >
                <option value="gpt-4-0613">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5</option>
            </Select>

            <label>System prompt</label>
            <Textarea
                value={systemPrompt}
                onChange={onSystemPromptChanged}
                rows={4}
            ></Textarea>

            <label>User prompt</label>
            <Textarea
                value={userPrompt}
                onChange={onUserPromptChanged}
                rows={4}
            ></Textarea>

            <label></label>
            <Button
                appearance="primary"
                onClick={onSend}
                disabled={busy}
            >
                Send
            </Button>

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

            <label className={classes.alignDefault}>Results</label>
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
