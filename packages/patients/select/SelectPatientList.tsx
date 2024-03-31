import * as React from "react";
import * as R from "remeda";

import {
    makeStyles,
    Body1,
    Caption1,
    shorthands,
    Spinner,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    MenuItemLink,
} from "@fluentui/react-components";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import { Card, CardHeader } from "@fluentui/react-components";

import * as FHIR from "@topical-ehr/fhir-types";
import { useGetPatientsQuery } from "@topical-ehr/fhir-store/patient-slice";
import { fhirTypeId } from "@topical-ehr/fhir-types/FhirUtils";
import { FhirSVG } from "@topical-ehr/ui-elements/FhirSVG";
import { EditIcon, DeleteIcon } from "@topical-ehr/ui-elements/Icons";

const useStyles = makeStyles({
    card: {
        // ...shorthands.margin("1em"),
        maxWidth: "20em",
        height: "fit-content",
    },
    list: {
        ...shorthands.margin("1em"),
        ...shorthands.gap("16px"),
        display: "flex",
        flexDirection: "column",
    },
});

interface Props {
    onSelected(selected: FHIR.Patient | null): void;
    onEdit(selected: FHIR.Patient): void;
}

export function SelectPatientList(props: Props) {
    const styles = useStyles();

    const patients = useGetPatientsQuery();

    const [selectedId, setSelectedId] = React.useState("");
    function onSelected(patient: FHIR.Patient | null) {
        setSelectedId(patient?.id ?? "");
        props.onSelected(patient);
    }

    if (patients.isLoading) {
        return <Spinner />;
    }

    const list = R.sortBy(patients.data ?? [], (p) => p.name?.[0]?.family ?? "");

    return (
        <div className={styles.list}>
            {list.map((patient) => (
                <Card
                    className={styles.card}
                    key={patient.id}
                    selected={selectedId === patient.id}
                    onSelectionChange={(_, { selected }) =>
                        onSelected(selected ? patient : null)
                    }
                >
                    <CardHeader
                        header={
                            <Body1>
                                <b>
                                    {patient?.name?.[0].family}
                                    {", "}
                                    {patient?.name?.[0].given}
                                </b>
                            </Body1>
                        }
                        description={<Caption1>{patient?.birthDate}</Caption1>}
                        action={
                            <Menu>
                                <MenuTrigger disableButtonEnhancement>
                                    <MenuButton
                                        appearance="transparent"
                                        icon={<MoreHorizontal20Regular />}
                                        aria-label="Actions"
                                    ></MenuButton>
                                </MenuTrigger>

                                <MenuPopover>
                                    <MenuList>
                                        <MenuItem
                                            onClick={() => {
                                                props.onEdit(patient);
                                            }}
                                            icon={<EditIcon />}
                                        >
                                            Edit
                                        </MenuItem>
                                        <MenuItem icon={<DeleteIcon />}>Delete</MenuItem>
                                        <MenuItemLink
                                            href={`/edit-fhir?fhirUrl=${encodeURIComponent(
                                                fhirTypeId(patient)
                                            )}`}
                                            target="_blank"
                                            icon={<FhirSVG />}
                                        >
                                            FHIR
                                        </MenuItemLink>
                                    </MenuList>
                                </MenuPopover>
                            </Menu>
                        }
                    />
                </Card>
            ))}
        </div>
    );
}
