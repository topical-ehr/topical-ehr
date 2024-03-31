import * as React from "react";
import {
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogContent,
    DialogBody,
    DialogActions,
    Button,
    TabList,
    Tab,
    SelectTabData,
    SelectTabEvent,
} from "@fluentui/react-components";

import * as FHIR from "@topical-ehr/fhir-types";
import { PatientForm } from "../PatientForm";
import { SelectPatientList } from "./SelectPatientList";
import {
    useAddPatientMutation,
    useUpdatePatientMutation,
} from "@topical-ehr/fhir-store/patient-slice";

interface Props {
    onClose(selected: FHIR.Patient | null): void;
}

export function SelectPatientDialog(props: Props) {
    const [selectedTab, setSelectedTab] = React.useState<string>("existing");

    const [selected, setSelected] = React.useState<FHIR.Patient | null>(null);
    const [editing, setEditing] = React.useState<FHIR.Patient | null>(null);

    const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
        if (data.value === "add") {
            setSelected(null);
        }
        setSelectedTab(data.value as string);
    };

    function onSelected(patient: FHIR.Patient | null) {
        setSelected(patient);
    }
    function onEdit(patient: FHIR.Patient) {
        setEditing(patient);
        setSelectedTab("edit");
    }
    function onCloseButton() {
        props.onClose(null);
    }
    function onSelectButton() {
        props.onClose(selected);
    }
    function setOpen(open: boolean) {
        if (!open) {
            props.onClose(null);
        }
    }

    const [addPatient, resultAdd] = useAddPatientMutation();
    const [updatePatient, resultUpdate] = useUpdatePatientMutation();
    const isLoading = resultAdd.isLoading || resultUpdate.isLoading;

    async function onSave(patient: FHIR.Patient) {
        const mutation = editing ? updatePatient : addPatient;

        await mutation(patient).unwrap();

        setSelectedTab("existing");
        setEditing(null);
    }

    return (
        <Dialog
            open
            onOpenChange={(event, data) => setOpen(data.open)}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Select Patient</DialogTitle>
                    <DialogContent>
                        <TabList
                            selectedValue={selectedTab}
                            onTabSelect={onTabSelect}
                        >
                            <Tab
                                id="existing"
                                value="existing"
                            >
                                Existing
                            </Tab>
                            {editing && (
                                <Tab
                                    id="edit"
                                    value="edit"
                                >
                                    Edit
                                </Tab>
                            )}
                            <Tab
                                id="add"
                                value="add"
                            >
                                Add new
                            </Tab>
                        </TabList>
                        {selectedTab === "existing" && (
                            <SelectPatientList
                                onEdit={onEdit}
                                onSelected={onSelected}
                            />
                        )}
                        {selectedTab === "add" && (
                            <PatientForm
                                onSave={onSave}
                                isLoading={isLoading}
                            />
                        )}
                        {editing && selectedTab === "edit" && (
                            <PatientForm
                                onSave={onSave}
                                isLoading={isLoading}
                                existing={editing}
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button
                                onClick={onCloseButton}
                                appearance="secondary"
                            >
                                Close
                            </Button>
                        </DialogTrigger>
                        <Button
                            appearance="primary"
                            disabled={!selected}
                            onClick={onSelectButton}
                        >
                            Select
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
