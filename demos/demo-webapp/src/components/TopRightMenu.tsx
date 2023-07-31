import React from "react";

import {
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    makeStyles,
    MenuItemLink,
} from "@fluentui/react-components";
import { FhirSVG } from "@topical-ehr/ui-elements/FhirSVG";

export const styles = makeStyles({
    topRight: {
        float: "right",
    },
});

interface Props {}

export function TopRightMenu(props: Props) {
    const classes = styles();
    return (
        <div className={classes.topRight}>
            <Menu
                openOnHover
                hoverDelay={1}
            >
                <MenuTrigger disableButtonEnhancement>
                    <MenuButton size="medium">🧑‍⚕️ Test User</MenuButton>
                </MenuTrigger>
                <MenuPopover>
                    <MenuList>
                        <MenuItemLink
                            href={`/edit-fhir?fhirUrl=Patient`}
                            target="_blank"
                            icon={<FhirSVG />}
                        >
                            FHIR editor
                        </MenuItemLink>
                    </MenuList>
                </MenuPopover>
            </Menu>
        </div>
    );
}
