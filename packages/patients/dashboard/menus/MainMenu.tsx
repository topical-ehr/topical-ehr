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
import { AddIcon } from "@topical-ehr/ui-elements/Icons";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import { actions } from "@topical-ehr/fhir-store";

export function MainMenu() {
    return (
        <Menu openOnHover>
            <MenuTrigger disableButtonEnhancement>
                <MenuButton
                    shape="circular"
                    size="small"
                />
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    <NewList />
                </MenuList>
            </MenuPopover>
        </Menu>
    );
}

function NewList() {
    const dispatch = useAppDispatch();
    function onNewList() {
        const title = prompt("List title");
        if (!title) {
            return;
        }

        const resource: FHIR.List = {
            resourceType: "List",
            ...FHIR.newMeta(),
            status: "current",
            mode: "working",
            code: FhirCodes.Codes.List.Patients,
            title,
        };

        dispatch(actions.edit(resource));
        dispatch(actions.save({ resource }));
    }
    return (
        <MenuItem
            icon={<AddIcon />}
            onClick={onNewList}
        >
            New list
        </MenuItem>
    );
}
