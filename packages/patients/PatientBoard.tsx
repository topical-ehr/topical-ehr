import React from "react";
import {
    DragDropContext,
    Draggable,
    DraggableLocation,
    DropResult,
    Droppable,
    DroppableProvided,
    DroppableStateSnapshot,
} from "react-beautiful-dnd";

import css from "./PatientBoard.module.scss";
import { makeStyles } from "@fluentui/react-components";
import { useFHIR } from "@topical-ehr/fhir-store";
import { FhirResourceById } from "@topical-ehr/fhir-types";
import * as FHIR from "@topical-ehr/fhir-types";
import { Codes } from "@topical-ehr/fhir-types/FhirCodes";
import { List } from "@fluentui/react";

interface Props {}

// const ParentContainer = styled.div`
//     height: ${({ height }) => height};
//     overflow-x: hidden;
//     overflow-y: auto;
// `;

const useStyles = makeStyles({
    boardContainer: {
        backgroundColor: "lightgreen",
        minHeight: "100vh",

        /* like display:flex but will allow bleeding over the window width */
        minWidth: "100vw",
        display: "inline-flex",
    },
});

export function PatientsBoard(props: Props) {
    const classes = useStyles();

    const lists = useFHIR((s) => s.fhir.resourcesWithEdits.lists);

    function onDragEnd(result: DropResult) {
        if (!result.destination) {
            // dropped nowhere
            return;
        }

        const source: DraggableLocation = result.source;
        const destination: DraggableLocation = result.destination;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            // did not move anywhere - can bail early
            return;
        }
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={classes.boardContainer}>
                <Droppable
                    droppableId="lists"
                    type="LIST"
                    direction="horizontal"
                    ignoreContainerClipping={false}
                >
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            <ListColumns
                                lists={lists}
                                snapshot={snapshot}
                            />
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
        </DragDropContext>
    );
}

// Memoise the list as recommended by https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/droppable.md#recommended-droppable--performance-optimisation
const ListColumns = React.memo(function ListColumns(props: {
    lists: FhirResourceById<FHIR.List>;
    snapshot: DroppableStateSnapshot;
}) {
    function listSorter(a: FHIR.List, b: FHIR.List) {
        function getOrder(list: FHIR.List) {
            const order = list.extension?.find(
                (e) => e.url === Codes.List.Extension.Order
            )?.valueDecimal;
            if (!order) {
                console.warn("getOrder: List has no order extension", { list });
            }
            return order ?? 0;
        }

        return getOrder(b) - getOrder(a);
    }

    return Object.values(props.lists)
        .sort(listSorter)
        .map((list, i) => (
            <ListColumn
                key={list.id}
                index={i}
                list={list}
            />
        ));
});

function ListColumn(props: { list: FHIR.List; index: number }) {
    return (
        <Draggable
            draggableId={props.list.id}
            index={props.index}
        >
            {(provided, snapshot, rubric) => (
                <div {...provided.draggableProps}>
                    <div {...provided.dragHandleProps}>{props.list.title}</div>
                    <Droppable
                        droppableId="patients"
                        type="PATIENT"
                        direction="vertical"
                        ignoreContainerClipping={false}
                    >
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <PatientList
                                    list={props.list}
                                    snapshot={snapshot}
                                />
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            )}
        </Draggable>
    );
}

// Memoise the list as recommended by https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/droppable.md#recommended-droppable--performance-optimisation
const PatientList = React.memo(function PatientList(props: {
    list: FHIR.List;
    snapshot: DroppableStateSnapshot;
}) {
    const patients = useFHIR((s) => s.fhir.resourcesWithEdits.patients);

    return (props.list.entry ?? []).map((entry, i) => (
        <PatientCard
            key={entry.item.reference}
            patient={patients[entry.item.reference]}
        />
    ));
});

const PatientCard = React.memo(function PatientCard(props: { patient: FHIR.Patient }) {
    return <div></div>;
});
