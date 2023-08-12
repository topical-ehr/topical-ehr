import React from "react";

import {
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    makeStyles,
    MenuItemLink,
} from "@fluentui/react-components";
import { FhirSVG } from "@topical-ehr/ui-elements/FhirSVG";
import { fhirUp, useFhirServerConfig } from "@topical-ehr/fhir-store/fhir-server";

import { ArrowDownloadFilled, ArrowDownloadRegular, bundleIcon } from "@fluentui/react-icons";
import { ArrowResetFilled, ArrowResetRegular } from "@fluentui/react-icons";
import { SettingsFilled, SettingsRegular } from "@fluentui/react-icons";
const DownloadIcon = bundleIcon(ArrowDownloadFilled, ArrowDownloadRegular);
const ResetIcon = bundleIcon(ArrowResetFilled, ArrowResetRegular);
const SettingsIcon = bundleIcon(SettingsFilled, SettingsRegular);

export const styles = makeStyles({
    topRight: {
        float: "right",
    },
});

interface Props {}

export function TopRightMenu(props: Props) {
    const classes = styles();

    const fhirConfig = useFhirServerConfig();

    function onSettings() {
        alert("TODO");
    }

    async function onDownload() {
        const server = await fhirUp(fhirConfig);
        server.exportAsDownload?.();
    }

    async function onReset() {
        const server = await fhirUp(fhirConfig);
        if (fhirConfig.server.type === "candlelite") {
            await server.loadSnapshot?.(fhirConfig.server.initialSnapshotUrl);
            window.location.reload();
        } else {
            alert("TODO");
        }
    }

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
                        <MenuItem
                            icon={<SettingsIcon />}
                            onClick={onSettings}
                        >
                            Settings
                        </MenuItem>
                        <MenuDivider />
                        <MenuItemLink
                            href={`/edit-fhir?fhirUrl=Patient`}
                            target="_blank"
                            icon={<FhirSVG />}
                        >
                            FHIR editor
                        </MenuItemLink>
                        <MenuItem
                            icon={<DownloadIcon />}
                            onClick={onDownload}
                        >
                            Download database
                        </MenuItem>
                        <MenuItem
                            icon={<ResetIcon />}
                            onClick={onReset}
                        >
                            Reset database
                        </MenuItem>
                    </MenuList>
                </MenuPopover>
            </Menu>
        </div>
    );
}