import { Button } from "@fluentui/react-components";
import { useFHIR } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";

export function MarkAsReadButton() {
    const dispatch = useAppDispatch();
    const patientId = useFHIR((s) => s.fhir.patientId);

    function onMarkAsRead() {}

    return (
        <Button
            appearance="outline"
            icon="✅"
            onClick={onMarkAsRead}
            disabled={false}
        >
            Mark all as read
        </Button>
    );
}
