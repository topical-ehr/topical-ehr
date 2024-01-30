import { Button } from "@fluentui/react-components";
import { actions, useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";

interface Props {
    icon: string;
    value: string;
}

function ViewButton(props: Props) {
    const showingInTimeline = useFHIR((s) => s.fhir.showingInTimeline);
    const dispatch = useAppDispatch();

    const showing = showingInTimeline[props.value];

    function onClick() {
        dispatch(
            actions.setShowInTimeline({
                group: props.value as keyof typeof showingInTimeline,
                show: !showing,
            })
        );
    }

    return (
        <Button
            style={showing ? {} : { filter: "grayscale(1)" }}
            title={(showing ? "Hide " : "Show ") + props.value}
            onClick={onClick}
            icon={props.icon}
        ></Button>
    );
}

export function TimelineViewButtons() {
    return (
        <div>
            <ViewButton
                value="obs"
                icon={"💓"}
            />
            <ViewButton
                value="labs"
                icon={"🧪"}
            />
            <ViewButton
                value="notes"
                icon={"📝"}
            />
            <ViewButton
                value="meds"
                icon={"💊"}
            />
        </div>
    );
}
