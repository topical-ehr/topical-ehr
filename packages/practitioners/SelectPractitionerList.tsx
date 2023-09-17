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
import { useGetPractitionersQuery } from "@topical-ehr/fhir-store/practitioner-slice";
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
    onSelected(selected: FHIR.Practitioner | null): void;
}

export function SelectPractitionerList(props: Props) {
    const styles = useStyles();

    const practitioners = useGetPractitionersQuery();

    const [selectedId, setSelectedId] = React.useState("");
    function onSelected(practitioner: FHIR.Practitioner | null) {
        setSelectedId(practitioner?.id ?? "");
        props.onSelected(practitioner);
    }

    if (practitioners.isLoading) {
        return <Spinner />;
    }

    const list = R.sortBy(practitioners.data ?? [], (p) => p.practitioner?.name?.[0]?.family ?? "");

    return (
        <div className={styles.list}>
            {list.map((practitioner) => (
                <Card
                    className={styles.card}
                    key={practitioner.practitioner.id}
                    selected={selectedId === practitioner.practitioner.id}
                    onSelectionChange={(_, { selected }) => onSelected(selected ? practitioner.practitioner : null)}
                >
                    <CardHeader
                        header={
                            <Body1>
                                <b>
                                    {practitioner?.practitioner?.name?.[0].family}
                                    {", "}
                                    {practitioner?.practitioner?.name?.[0].given}
                                </b>
                            </Body1>
                        }
                        description={<Caption1>{practitioner?.role?.code?.[0].text}</Caption1>}
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
                                        <MenuItem icon={<EditIcon />}>Edit</MenuItem>
                                        <MenuItem icon={<DeleteIcon />}>Delete</MenuItem>
                                        <MenuItemLink
                                            href={`/edit-fhir?fhirUrl=${encodeURIComponent(
                                                fhirTypeId(practitioner.practitioner)
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
