import React from "react";
import { Button, MenuList, MenuItemCheckbox, makeStyles, tokens, MenuGroup, MenuDivider } from "@fluentui/react-components";
import { Alert } from "@fluentui/react-components/unstable";

import { useTopicContext } from "../TopicContext";

import { useTopicsConfig } from "../TopicsConfig";
import { TopicItemEdit } from "./TopicItemEdit";
import { ConditionTopicItemState } from "./items/ConditionTopicItems";

interface Props {
    apiUrl: string;
}

const styles = makeStyles({
    vspace: {
        marginBottom: tokens.spacingVerticalM,
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

    async function onSuggest() {
        setBusy(true);
        setSuggestions(null);
        setError("");

        try {
            const { composition } = context.topic;
            const html = composition?.section?.[0].text?.div ?? "";

            const payload = {
                systemPrompt:
                    "You are an expert medical coder. Your task is to accurately extract medical diagnoses from the provided text into a JSON array of objects with these properties: original_text, diagnosis_name. The diagnosis name is just the diagnosis, without acronyms or additional info.",
                userPrompt: html,
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

    return (
        <div className={classes.vspace}>
            <Button
                disabled={busy}
                appearance="secondary"
                onClick={onSuggest}
                className={classes.vspace}
            >
                🤖 Suggest conditions
            </Button>
            {error && <Alert intent="error">{error}</Alert>}
            {suggestions !== null && (
                <div className={classes.vspace}>
                    <MenuList>
                        {suggestions.map((s) => (
                            <MenuGroup>
                                <MenuItemCheckbox
                                    name="suggestion"
                                    key={s}
                                    value={s}
                                >
                                    {s}
                                </MenuItemCheckbox>
                                <MenuDivider />
                            </MenuGroup>
                        ))}
                    </MenuList>
                </div>
            )}
            {suggestions !== null && suggestions.length > 0 && (
                <Button
                    appearance="primary"
                    onClick={onAddSuggestions}
                >
                    Add suggestions
                </Button>
            )}
            {suggestions !== null && suggestions.length === 0 && <div>No suggestions</div>}
        </div>
    );
}

function nop() {}
