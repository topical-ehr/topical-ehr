import React from "react";
import * as FHIR from "@topical-ehr/fhir-types";
import { TextField } from "@topical-ehr/ui-elements/TextField";

import css from "./TitleEdit.module.scss";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import { actions } from "@topical-ehr/fhir-store";
import { useTopicContext } from "../TopicContext";

interface Props {}

export function TitleEdit(props: Props) {
    const dispatch = useAppDispatch();
    const context = useTopicContext();
    const { composition } = context.topic;

    if (!context.editing) {
        return null;
    }

    function onTitleChanged(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) {
        dispatch(
            actions.edit({
                ...composition,
                title: newValue,
            } as FHIR.Resource)
        );
    }

    return (
        <>
            <div>Topic title</div>
            <TextField
                label=""
                errorMessage=""
                value={composition?.title}
                onChange={onTitleChanged}
                className={css.titleTextbox}
            />
        </>
    );
}
