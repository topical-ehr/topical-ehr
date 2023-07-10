import { Button, Checkbox, makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { Alert } from "@fluentui/react-components/unstable";
import React from "react";

import { useTopicContext } from "../TopicContext";

import { useTopicsConfig } from "../TopicsConfig";

interface Props {
    apiUrl: string;
}

const styles = makeStyles({
    container: {
        ...shorthands.border("1px", "solid", "orange"),
        paddingTop: tokens.spacingVerticalM,
        paddingLeft: tokens.spacingVerticalM,
        marginBottom: tokens.spacingVerticalM,
    },
    vspace: {
        marginBottom: tokens.spacingVerticalM,
    },
    resultsHeading: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginRight: tokens.spacingHorizontalM,
        "& a": {
            fontSize: "large",
        },
    },
    addButton: {
        ...shorthands.margin(tokens.spacingHorizontalM),
    },
});

export function ConditionCodingAI(props: Props) {
    const config = useTopicsConfig();
    const context = useTopicContext();

    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState("");
    const [suggestions, setSuggestions] = React.useState<string[] | null>(null);

    const classes = styles();

    if (!context.editing) {
        return null;
    }

    const { composition } = context.topic;
    const html = composition?.section?.[0].text?.div ?? "";

    const model = "gpt-4-0613";
    const systemPrompt =
        "You are an expert medical coder. " +
        "Your task is to accurately extract medical diagnoses " +
        "from the provided text into a JSON array of objects " +
        "with these properties: original_text, diagnosis_name, diagnosis_icd_code, diagnosis_snomed_code. " +
        "The diagnosis name is just the SNOMED diagnosis, without acronyms or additional info.";

    const userPrompt = html;

    const editorLink = `/edit-prompt?model=${model}&systemPrompt=${encodeURIComponent(
        systemPrompt
    )}&userPrompt=${encodeURIComponent(userPrompt)}`;

    async function onSuggest() {
        setBusy(true);
        setSuggestions(null);
        setError("");

        try {
            const payload = {
                model,
                temperature: 0,
                systemPrompt,
                userPrompt,
            };
            const response = await fetch(props.apiUrl, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "content-type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const reply = await response.json();

            const jsonStringFromAI = reply.completion.choices[0].message.content;
            const replyFromAI = JSON.parse(jsonStringFromAI);

            const suggestionSet = new Set<string>();
            for (const origSuggestion of replyFromAI) {
                suggestionSet.add(origSuggestion.diagnosis_name);
            }
            setSuggestions([...suggestionSet].sort());
        } catch (err) {
            setError(err.toString());
        } finally {
            setBusy(false);
        }
    }

    function onAddSuggestions() {
        alert("TODO");
    }

    const modelName = "OpenAI GPT-4";

    return (
        <div className={classes.container}>
            {suggestions === null && (
                <Button
                    disabled={busy}
                    appearance="subtle"
                    onClick={onSuggest}
                    className={classes.vspace}
                >
                    {!busy ? "🤖 Suggest conditions" : `Waiting for ${modelName}...`}
                </Button>
            )}
            {error && <Alert intent="error">{error}</Alert>}
            {suggestions !== null && (
                <div className={classes.vspace}>
                    <div className={classes.resultsHeading}>
                        <p>Conditions from {modelName}:</p>
                        <a
                            href={editorLink}
                            target="_blank"
                        >
                            🤖
                        </a>
                    </div>
                    {suggestions.map((s) => (
                        <div>
                            <Checkbox
                                name="suggestion"
                                key={s}
                                value={s}
                                label={s}
                            />
                        </div>
                    ))}
                </div>
            )}
            {suggestions !== null && suggestions.length > 0 && (
                <Button
                    appearance="primary"
                    onClick={onAddSuggestions}
                    className={classes.addButton}
                >
                    Add selected
                </Button>
            )}
            {suggestions !== null && suggestions.length === 0 && <div>No suggestions</div>}
        </div>
    );
}

function nop() {}
