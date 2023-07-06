import { makeStyles, tokens } from "@fluentui/react-components";
import React from "react";

import { actions } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import * as FHIR from "@topical-ehr/fhir-types";
import { RichTextEditor } from "@topical-ehr/rich-text-editor";
import { useTopicContext } from "../TopicContext";

interface Props {}

const styles = makeStyles({
    container: {
        marginTop: tokens.spacingVerticalM,
    },
});

export function SummaryEdit(props: Props) {
    const dispatch = useAppDispatch();
    const context = useTopicContext();
    const { composition } = context.topic;

    const [initialHTML, _] = React.useState(composition.section?.[0].text?.div ?? null);

    function onChanged(html: string) {
        const updatedComposition = FHIR.Composition.setHTML(html, composition);
        dispatch(actions.edit(updatedComposition));
    }

    const classes = styles();

    if (!context.editing) {
        return null;
    }

    return (
        <div className={classes.container}>
            <RichTextEditor
                initialHTML={initialHTML}
                placeholder={
                    <>
                        <p>Summary</p>
                        <p></p>
                        <p># Heading</p>
                        <p>Details</p>
                    </>
                }
                onChangedHTML={onChanged}
            />
        </div>
    );
}
