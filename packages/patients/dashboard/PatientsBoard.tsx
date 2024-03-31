import React from "react";
import { Card, CardHeader, Caption1, Button, Text } from "@fluentui/react-components";
import {
    AlertUrgent16Filled,
    Attach16Regular,
    CheckmarkCircle16Regular,
    CircleHalfFill16Regular,
    Comment16Regular,
    MoreHorizontal20Regular,
} from "@fluentui/react-icons";
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
import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { FhirResourceById } from "@topical-ehr/fhir-types";
import * as FHIR from "@topical-ehr/fhir-types";
import * as FhirCodes from "@topical-ehr/fhir-types/FhirCodes";
import { Codes } from "@topical-ehr/fhir-types/FhirCodes";
import { ErrorMessage } from "@topical-ehr/ui-elements/ErrorMessage";
import { useFormatting } from "@topical-ehr/formatting/formatting";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import { ListMenu } from "./menus/ListMenu";

interface Props {}

// const ParentContainer = styled.div`
//     height: ${({ height }) => height};
//     overflow-x: hidden;
//     overflow-y: auto;
// `;

export function PatientsBoard(props: Props) {
    const lists = useFHIR((s) => s.fhir.resourcesWithEdits.lists);

    function onDragEnd(result: DropResult) {
        if (!result.destination) {
            // dropped nowhere
            return;
        }

        const source: DraggableLocation = result.source;
        const destination: DraggableLocation = result.destination;

        console.log("onDragEnd", { source, destination });

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
            <div className={css.board}>
                <Droppable
                    droppableId="lists"
                    type="LIST"
                    direction="horizontal"
                    ignoreContainerClipping={false}
                >
                    {(provided, snapshot) => (
                        <div
                            className={css.columns}
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
                // if no order extension then sort approximately alphabetically
                return list.title?.charCodeAt(0) ?? 0;
            }
            return order ?? 0;
        }

        return getOrder(a) - getOrder(b);
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
                <div
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className={css.column}
                >
                    <h3
                        title="Drag to re-order lists"
                        {...provided.dragHandleProps}
                    >
                        {props.list.title}
                        <span style={{ marginLeft: "0.5em" }} />
                        <ListMenu list={props.list} />
                    </h3>
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

const ListHeader = React.memo(function ListHeader(props: {
    list: FHIR.List;
    snapshot: DroppableStateSnapshot;
}) {
    const patients = useFHIR((s) => s.fhir.resourcesWithEdits.patients);

    return <h3>{props.list.title}</h3>;
});

// Memoise the list as recommended by https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/droppable.md#recommended-droppable--performance-optimisation
const PatientList = React.memo(function PatientList(props: {
    list: FHIR.List;
    snapshot: DroppableStateSnapshot;
}) {
    const patients = useFHIR((s) => s.fhir.resourcesWithEdits.patients);
    return (props.list.entry ?? []).map((entry, i) =>
        entry.item.reference ? (
            <PatientCard
                key={entry.item.reference}
                patient={patients[FHIR.parseRef(entry.item.reference)!.id]}
                index={i}
            />
        ) : (
            <ErrorMessage error={`Missing reference in List/${props.list.id}`} />
        )
    );
});

const PatientCard = React.memo(function PatientCard(props: {
    patient: FHIR.Patient;
    index: number;
}) {
    const formatting = useFormatting();
    const pf = formatting.patient(props.patient);
    const { age, gender, born } = pf.ageGenderBorn;
    return (
        <Draggable
            draggableId={props.patient.id}
            index={props.index}
        >
            {(provided, snapshot, rubric) => (
                <div
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                >
                    <Card
                        className={css.patientCard}
                        size="small"
                        role="listitem"
                    >
                        <CardHeader
                            // image={{ as: "img", src: excelLogo, alt: "Excel app logo" }}
                            image="🧑‍"
                            header={
                                <Text weight="semibold">
                                    <div {...provided.dragHandleProps}>{pf.name}</div>
                                </Text>
                            }
                            description={
                                <Caption1 className={""}>
                                    {age} {gender}
                                </Caption1>
                            }
                            action={
                                <Button
                                    appearance="transparent"
                                    icon={<MoreHorizontal20Regular />}
                                />
                            }
                        />
                    </Card>
                </div>
            )}
        </Draggable>
    );
});
