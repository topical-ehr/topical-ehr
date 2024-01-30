import { useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";

import { Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger } from "@fluentui/react-components";

export function AIButton() {
    const dispatch = useAppDispatch();
    const patientId = useFHIR((s) => s.fhir.patientId);

    function onSuggestDiagnoses() {}

    return (
        <Menu
            openOnHover
            hoverDelay={1}
        >
            <MenuTrigger disableButtonEnhancement>
                <MenuButton size="medium">🤖 AI Suggestions</MenuButton>
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    <MenuItem icon={"🔎"}>Un-coded diagnoses</MenuItem>
                    <MenuItem icon={"📝"}>Note to summmary</MenuItem>
                    <MenuItem icon={"🦓"}>May be missed</MenuItem>
                    <MenuItem icon={"📑"}>Management</MenuItem>
                </MenuList>
            </MenuPopover>
        </Menu>
    );
}
