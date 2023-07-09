import React from "react";

import * as FHIR from "@topical-ehr/fhir-types";
import { Checkbox, MenuDivider } from "@fluentui/react-components";
import {
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuItemLink,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Tooltip,
} from "@fluentui/react-components";
import {
    DocumentBulletListRegular,
    DocumentBulletListFilled,
    bundleIcon,
    EditRegular,
    EditFilled,
    NoteFilled,
    NoteRegular,
} from "@fluentui/react-icons";
import { DefaultButton, PrimaryButton, Stack } from "@fluentui/react";
import { actions, useFHIR, useDispatch } from "@topical-ehr/fhir-store";
import { RichTextEditor } from "@topical-ehr/rich-text-editor";

import { ChangesPanel } from "./ChangesPanel";
import { Codes } from "@topical-ehr/fhir-types/FhirCodes";

const EditIcon = bundleIcon(EditFilled, EditRegular);
const NoteIcon = bundleIcon(NoteFilled, NoteRegular);
const DocumentBulletListIcon = bundleIcon(DocumentBulletListFilled, DocumentBulletListRegular);

interface Props {}

export function EditsPanel(props: Props) {
    const dispatch = useDispatch();
    const patientId = useFHIR((s) => s.fhir.patientId);
    const saveState = useFHIR((s) => s.fhir.saveState);

    const [noteHTML, setNote] = React.useState<string>("");

    function onSave() {
        if (!noteHTML) {
            alert("Please enter a note");
        }

        // create composition for the progress note
        const now = new Date().toISOString();
        const newComposition = FHIR.Composition.new({
            subject: { reference: `Patient/${patientId}` },
            status: "final",
            type: Codes.Composition.Type.ProgressNote,
            date: now,
            title: "New topic",
            section: [
                {
                    title: "Progress note",
                    text: {
                        div: `<div>${noteHTML}</div>`,
                        status: "additional",
                    },
                },
            ],
        });
        dispatch(actions.edit(newComposition));

        // save to FHIR server
        dispatch(actions.setSaveState({ state: "save-requested" }));

        setNote("");
    }
    function onUndoAll() {
        dispatch(actions.undoAll());
    }

    return (
        <div style={{ marginLeft: "1em" }}>
            <Stack
                horizontal
                tokens={{ childrenGap: 10 }}
            >
                {/* <DefaultButton text="🗄️ Template" /> */}
                <TemplateMenu />
            </Stack>

            <div style={{ marginTop: "1em", marginBottom: "1em" }}>
                <RichTextEditor
                    initialHTML=""
                    placeholder={<p>Progress note</p>}
                    onChangedHTML={setNote}
                />
            </div>
            <div title="Minor notes are hidden in the timeline (by default)">
                <Checkbox label="Minor" />
            </div>
            <ChangesPanel />
            <Stack
                horizontal
                tokens={{ childrenGap: 10 }}
            >
                <PrimaryButton
                    // disabled={saveState !== null}
                    text="Save"
                    onClick={onSave}
                />
                {/* <DefaultButton disabled={saveState !== null} text="Undo all" onClick={onUndoAll} /> */}
            </Stack>
        </div>
    );
}

function TemplateMenu() {
    const templates = ["Admission", "Progress notes", "Ward review", "Ward round"];
    return (
        <Menu>
            <MenuTrigger disableButtonEnhancement>
                <Tooltip
                    content="Show templates"
                    relationship="label"
                >
                    <MenuButton size="medium">🗄️ Template</MenuButton>
                </Tooltip>
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    {templates.map((text) => (
                        <TemplateMenuItem
                            text={text}
                            key={text}
                        />
                    ))}
                    <MenuDivider />
                    <MenuItem icon={<EditIcon />}>Add/update...</MenuItem>
                </MenuList>
            </MenuPopover>
        </Menu>
    );
}

function TemplateMenuItem(props: { text: string }) {
    return <MenuItem icon={<DocumentBulletListIcon />}>{props.text}</MenuItem>;
}
