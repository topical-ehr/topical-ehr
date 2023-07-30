import React from "react";

import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";

import {
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    MenuItemCheckbox,
    MenuPopover,
    MenuTrigger,
    Tooltip,
} from "@fluentui/react-components";
import { RecordObsPanelId } from "../panels/RecordObsPanel";
import { RecordMedsPanelId } from "../panels/RecordMedsPanel";

interface Props {}

export function TimelineRecordMenu(props: Props) {
    const showingPanels = useFHIR((s) => s.fhir.showingPanels);
    const dispatch = useAppDispatch();

    const showingPanelIds: string[] = Object.entries(showingPanels)
        .map(([id, showing]) => (showing ? id : null))
        .filter((x): x is string => typeof x === "string");

    function onChanged(newCheckedItems: string[]) {
        const panels = [RecordMedsPanelId, RecordObsPanelId];

        for (const panelId of panels) {
            if (showingPanels[panelId] && !newCheckedItems.includes(panelId)) {
                dispatch(actions.hidePanel(panelId));
            } else if (!showingPanels[panelId] && newCheckedItems.includes(panelId)) {
                dispatch(actions.showPanel(panelId));
            }
        }
    }

    return (
        <Menu
            checkedValues={{ show: showingPanelIds }}
            onCheckedValueChange={(e, { name, checkedItems }) => {
                onChanged(checkedItems);
            }}
            openOnHover
            hoverDelay={1}
        >
            <MenuTrigger disableButtonEnhancement>
                <Tooltip
                    content="Record"
                    relationship="label"
                >
                    <MenuButton size="medium">📋 Record</MenuButton>
                </Tooltip>
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    <MenuItemCheckbox
                        name="show"
                        value={RecordObsPanelId}
                        icon={"💓"}
                    >
                        Obs
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        name="show"
                        value={RecordMedsPanelId}
                        icon={"💊"}
                    >
                        Meds
                    </MenuItemCheckbox>
                </MenuList>
            </MenuPopover>
        </Menu>
    );
}
