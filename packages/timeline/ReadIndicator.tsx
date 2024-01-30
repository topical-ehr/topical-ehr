import React from "react";
import * as FHIR from "@topical-ehr/fhir-types";
import { actions, useFHIR } from "@topical-ehr/fhir-store";

import css from "./ReadIndicator.module.scss";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";

interface Props extends React.PropsWithChildren {
    resource: FHIR.Resource;
}

export function ReadIndicator(props: Props) {
    const unread = useFHIR((state) => state.fhir.unread);
    const dispatch = useAppDispatch();

    const isUnread = FHIR.typeId(props.resource) in unread;

    function markAsRead() {
        dispatch(actions.markRead(props.resource));
    }

    if (isUnread) {
        return (
            <div
                title="Click to mark as read"
                className={css.unread}
                onClick={markAsRead}
            >
                {props.children}
            </div>
        );
    } else {
        return props.children;
    }
}
