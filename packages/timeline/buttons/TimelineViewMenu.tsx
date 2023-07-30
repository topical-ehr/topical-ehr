import React from "react";

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

interface Props {}

export function TimelineViewMenu(props: Props) {
    return (
        <Menu
            openOnHover
            hoverDelay={1}
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
