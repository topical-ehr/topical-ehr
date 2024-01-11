import React from "react";

import {
    Menu,
    MenuButton,
    MenuList,
    MenuItemCheckbox,
    MenuPopover,
    MenuTrigger,
    MenuProps,
} from "@fluentui/react-components";
import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";

export function TimelineViewMenu() {
    const showing = useFHIR((s) => s.fhir.showingInTimeline);
    const dispatch = useAppDispatch();

    const checkedValues = Object.fromEntries(
        Object.entries(showing)
            .filter(([k, v]) => v)
            .map(([k, v]) => [k, [k]])
    );
    const onChange: MenuProps["onCheckedValueChange"] = (e, { name, checkedItems }) => {
        dispatch(
            actions.setShowInTimeline({
                group: name as keyof typeof showing,
                show: checkedItems.length > 0,
            })
        );
    };

    return (
        <Menu
            openOnHover
            hoverDelay={1}
            checkedValues={checkedValues}
            onCheckedValueChange={onChange}
        >
            <MenuTrigger disableButtonEnhancement>
                <MenuButton size="medium">👀️ View</MenuButton>
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    <MenuItemCheckbox
                        name="obs"
                        value="obs"
                        icon={"💓"}
                    >
                        Obs
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        name="labs"
                        value="labs"
                        icon={"🧪"}
                    >
                        Labs
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        name="notes"
                        value="notes"
                        icon={"🗈"}
                    >
                        Notes
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        name="meds"
                        value="meds"
                        icon={"💊"}
                    >
                        Meds
                    </MenuItemCheckbox>
                </MenuList>
            </MenuPopover>
        </Menu>
    );
}
