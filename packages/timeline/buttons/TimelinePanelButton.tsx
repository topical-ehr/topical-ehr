import { Button, ToggleButton } from "@fluentui/react-components";
import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";

interface Props {
    text: string;
    tooltip: string;
    panel: string;
}

export function TimelinePanelButton(props: Props) {
    const showing = useFHIR((s) => s.fhir.showingPanels[props.panel]);
    const dispatch = useAppDispatch();

    function onClick() {
        dispatch((showing ? actions.hidePanel : actions.showPanel)(props.panel));
    }

    return (
        <ToggleButton
            onClick={onClick}
            checked={showing}
            title={props.tooltip}
        >
            {props.text}
        </ToggleButton>
    );
}
