import React from "react";
import { DateTime } from "luxon";

import { useFHIR } from "@topical-ehr/fhir-store";
import { Codes } from "@topical-ehr/fhir-types/FhirCodes";
import { DocumentView } from "@topical-ehr/timeline/documents/DocumentView";

import css from "./NotesList.module.scss";

interface Props {
    taskId?: string; // reference to Task or null for general progress notes
}

export function NotesList(props: Props) {
    const { taskId } = props;
    const allCompositions = useFHIR((s) => s.fhir.resourcesFromServer.compositions);

    const compositions = React.useMemo(() => {
        // progress notes
        const { code, system } = Codes.Composition.Type.ProgressNote.coding[0];
        return Object.values(allCompositions).filter(
            (composition) => composition.type.coding?.[0].code === code && composition.type.coding?.[0].system === system
        );
    }, [allCompositions]);

    const taskCompositions = React.useMemo(() => {
        if (!taskId) {
            // general progress notes
            return compositions.filter((composition) => composition.event == null);
        } else {
            // task-specific notes
            // TODO: handle other FHIR structures
            return compositions.filter((composition) => composition.event?.[0].detail?.[0].reference === "Task" + taskId);
        }
    }, [compositions, taskId]);

    // scroll to bottom on mounting
    const listRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTo(0, listRef.current.scrollHeight);
        }
    }, []);

    return (
        <div
            className={css.notesList}
            ref={listRef}
        >
            {taskCompositions.map((composition) => (
                <DocumentView
                    key={composition.id}
                    document={composition}
                    time={DateTime.fromISO(composition.date).toLocaleString(DateTime.TIME_SIMPLE)}
                />
            ))}
        </div>
    );
}
