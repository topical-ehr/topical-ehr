import React from "react";

import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";

import { Menu, MenuButton, MenuDivider, MenuItem, MenuList, MenuPopover, MenuTrigger } from "@fluentui/react-components";
import { RecordObsPanelId } from "../panels/RecordObsPanel";
import { RecordMedsPanelId } from "../panels/RecordMedsPanel";

interface Props {}

export function TimelineRecordMenu(props: Props) {
    const showingPanels = useFHIR((s) => s.fhir.showingPanels);

    return (
        <Menu
            openOnHover
            hoverDelay={1}
        >
            <MenuTrigger disableButtonEnhancement>
                <MenuButton size="medium">📋 Record</MenuButton>
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    <Item
                        icon={"💓"}
                        text="Obs"
                        panel={RecordObsPanelId}
                    />
                    <Item
                        icon={"💊"}
                        text="Meds"
                        panel={RecordMedsPanelId}
                    />
                </MenuList>
            </MenuPopover>
        </Menu>
    );
}

interface ItemProps {
    text: string;
    icon: string;
    panel: string;
}

export function Item(props: ItemProps) {
    const showing = useFHIR((s) => s.fhir.showingPanels[props.panel]);
    const dispatch = useAppDispatch();

    function onClick() {
        if (showing) {
            // don't allow to hide panels
            // use may lose work by accident
            // they can use the cancel button
            return;
        }
        dispatch((showing ? actions.hidePanel : actions.showPanel)(props.panel));
    }

    return (
        <MenuItem
            onClick={onClick}
            icon={props.icon}
            title={"Record " + props.text}
        >
            {props.text}
        </MenuItem>
    );
}
