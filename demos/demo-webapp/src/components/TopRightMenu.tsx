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
import { useFHIR } from "@topical-ehr/fhir-store";
import { SelectPractitionerDialog } from "@topical-ehr/practitioners/SelectPractitionerDialog";

import { ArrowDownloadFilled, ArrowDownloadRegular, bundleIcon } from "@fluentui/react-icons";
import { ArrowResetFilled, ArrowResetRegular } from "@fluentui/react-icons";
import { ArrowSwapFilled, ArrowSwapRegular } from "@fluentui/react-icons";
import { SettingsFilled, SettingsRegular } from "@fluentui/react-icons";

import * as FHIR from "@topical-ehr/fhir-types";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import { actions } from "@topical-ehr/fhir-store";
import { useGetPractitionerQuery } from "@topical-ehr/fhir-store/practitioner-slice";

const SwapIcon = bundleIcon(ArrowSwapFilled, ArrowSwapRegular);
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

    const practitionerId = useFHIR((s) => s.fhir.practitionerId);
    const practitioner = useGetPractitionerQuery(practitionerId);

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

    const [selectPractitioner, setSelectPractitioner] = React.useState(false);
    const dispatch = useAppDispatch();
    function onSelectedPractitioner(selected: FHIR.Practitioner | null) {
        if (selected) {
            dispatch(actions.setPractitioner(selected));
        }
        setSelectPractitioner(false);
    }

    if (practitioner.isLoading) {
        return null;
    }
    const name = practitioner.data?.name?.[0];

    return (
        <div className={classes.topRight}>
            {selectPractitioner && <SelectPractitionerDialog onClose={onSelectedPractitioner} />}
            <Menu
                openOnHover
                hoverDelay={1}
            >
                <MenuTrigger disableButtonEnhancement>
                    <MenuButton size="medium">
                        🧑‍⚕️ {name?.given} {name?.family}
                    </MenuButton>
                </MenuTrigger>
                <MenuPopover>
                    <MenuList>
                        <MenuItem
                            icon={<SettingsIcon />}
                            onClick={onSettings}
                        >
                            Settings
                        </MenuItem>
                        <MenuItem
                            icon={<SwapIcon />}
                            onClick={() => setSelectPractitioner(true)}
                        >
                            Change user
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
