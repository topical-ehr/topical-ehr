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
import { PractitionerForm } from "./PractitionerForm";
import { SelectPractitionerList } from "./SelectPractitionerList";
import { PractitionerWithRole } from "@topical-ehr/fhir-store/practitioner-slice";

interface Props {
    onClose(selected: FHIR.Practitioner | null): void;
}

export function SelectPractitionerDialog(props: Props) {
    const [selectedTab, setSelectedTab] = React.useState<string>("existing");

    const [selected, setSelected] = React.useState<FHIR.Practitioner | null>(null);
    const [editing, setEditing] = React.useState<PractitionerWithRole | null>(null);

    const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
        if (data.value === "add") {
            setSelected(null);
        }
        setSelectedTab(data.value as string);
    };
    function onSubmitted() {
        setSelectedTab("existing");
        setEditing(null);
    }

    function onSelected(practitioner: FHIR.Practitioner | null) {
        setSelected(practitioner);
    }
    function onEdit(practitioner: PractitionerWithRole) {
        setEditing(practitioner);
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

    return (
        <Dialog
            open
            onOpenChange={(event, data) => setOpen(data.open)}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Select Practitioner</DialogTitle>
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
                            <SelectPractitionerList
                                onEdit={onEdit}
                                onSelected={onSelected}
                            />
                        )}
                        {selectedTab === "add" && <PractitionerForm onSubmitted={onSubmitted} />}
                        {editing && selectedTab === "edit" && (
                            <PractitionerForm
                                onSubmitted={onSubmitted}
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
