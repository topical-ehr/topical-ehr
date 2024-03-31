import React from "react";
import {
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuItemLink,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Tooltip,
} from "@fluentui/react-components";

import * as FHIR from "@topical-ehr/fhir-types";
import * as FhirCodes from "@topical-ehr/fhir-types/FhirCodes";
import { AddIcon, DeleteIcon, RenameIcon } from "@topical-ehr/ui-elements/Icons";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import { actions } from "@topical-ehr/fhir-store";
import { SelectPatientDialog } from "../../select/SelectPatientDialog";

interface Props {
    list: FHIR.List;
}
export function ListMenu({ list }: Props) {
    const dispatch = useAppDispatch();

    const [adding, setAdding] = React.useState(false);

    function onAddPatient() {
        setAdding(true);
    }
    function onPatientSelected(patient: FHIR.Patient | null) {
        if (patient) {
            dispatch(actions.listAdd({ list, add: patient }));
            dispatch(actions.save(list));
        }

        setAdding(false);
    }

    function onRename() {
        const newName = prompt("New name", list.title);
        if (newName) {
            const newList = { ...list, title: newName };
            dispatch(actions.edit(newList));
            dispatch(actions.save(newList));
        }
    }

    function onDelete() {
        dispatch(actions.deleteImmediately(list));
    }

    return (
        <>
            {adding && <SelectPatientDialog onClose={onPatientSelected} />}

            <Menu openOnHover>
                <MenuTrigger disableButtonEnhancement>
                    <MenuButton
                        shape="circular"
                        size="small"
                    />
                </MenuTrigger>
                <MenuPopover>
                    <MenuList>
                        <MenuItem
                            icon={<AddIcon />}
                            onClick={onAddPatient}
                        >
                            Add patient
                        </MenuItem>
                        <MenuItem
                            icon={<RenameIcon />}
                            onClick={onRename}
                        >
                            Rename this list
                        </MenuItem>
                        <MenuItem
                            icon={<DeleteIcon />}
                            onClick={onDelete}
                        >
                            Delete this list
                        </MenuItem>
                    </MenuList>
                </MenuPopover>
            </Menu>
        </>
    );
}
