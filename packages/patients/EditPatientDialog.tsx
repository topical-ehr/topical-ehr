import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";

import * as FHIR from "@topical-ehr/fhir-types";
import { PatientForm } from "./PatientForm";

interface Props {
    patient: FHIR.Patient;
    onClose(save: FHIR.Patient | null): void;
}

export function EditPatientDialog(props: Props) {
    function onCloseButton() {
        props.onClose(null);
    }
    function setOpen(open: boolean) {
        if (!open) {
            props.onClose(null);
        }
    }
    function onSave(newPatient: FHIR.Patient) {
        props.onClose(newPatient);
    }

    return (
        <Dialog
            open
            onOpenChange={(event, data) => setOpen(data.open)}
        >
            <DialogSurface style={{ maxWidth: "800px" }}>
                <DialogBody>
                    <DialogTitle
                        action={
                            <DialogTrigger action="close">
                                <Button
                                    appearance="subtle"
                                    aria-label="close"
                                    title="Cancel changes and close"
                                    icon={<Dismiss24Regular />}
                                />
                            </DialogTrigger>
                        }
                    >
                        Edit patient
                    </DialogTitle>
                    <DialogContent>
                        <PatientForm
                            existing={props.patient}
                            onSave={onSave}
                            error={undefined}
                            isLoading={false}
                        />
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button
                                onClick={onCloseButton}
                                appearance="secondary"
                                title="Cancel changes and close"
                            >
                                Close
                            </Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
