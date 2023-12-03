import React from "react";

import { PrimaryButton, Stack } from "@fluentui/react";
import {
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Tab,
    TabList,
    Tooltip,
} from "@fluentui/react-components";
import {
    DocumentBulletListFilled,
    DocumentBulletListRegular,
    EditFilled,
    EditRegular,
    NoteFilled,
    NoteRegular,
    bundleIcon,
} from "@fluentui/react-icons";
import { actions, useDispatch, useFHIR } from "@topical-ehr/fhir-store";
import { GetRichTextContents, RichTextEditor } from "@topical-ehr/rich-text-editor";

import { ChangesPanel } from "./ChangesPanel";

import css from "./NotesPanel.module.scss";
import { NotesList } from "./NotesList";

const EditIcon = bundleIcon(EditFilled, EditRegular);
const NoteIcon = bundleIcon(NoteFilled, NoteRegular);
const DocumentBulletListIcon = bundleIcon(DocumentBulletListFilled, DocumentBulletListRegular);

interface Props {}

export function NotesPanel(props: Props) {
    // temporary hack to clear editor on save
    const saveGeneration = useFHIR((s) => s.fhir.saveGeneration);
    return <NotesPanelInner key={saveGeneration} />;
}
function NotesPanelInner(props: Props) {
    const dispatch = useDispatch();

    const getRichTextContents = React.useRef<GetRichTextContents>();

    function onNotesChanged(getContents: GetRichTextContents) {
        getRichTextContents.current = getContents;
    }

    function onSave() {
        if (!getRichTextContents.current) {
            console.warn("getRichTextContents is null");
            return;
        }
        const progressNote = getRichTextContents.current();
        if (!progressNote.markdown) {
            alert("Please enter a note");
            return;
        }

        dispatch(actions.save({ progressNote }));
    }
    function onUndoAll() {
        dispatch(actions.undoAll());
    }

    return (
        <div className={css.notesPanel}>
            <TabList
                selectedValue={"existing"}
                onTabSelect={() => {}}
            >
                <Tab
                    id="existing"
                    value="existing"
                >
                    Progress Notes
                </Tab>
            </TabList>

            <NotesList />

            <Stack
                horizontal
                tokens={{ childrenGap: 10 }}
            >
                {/* <DefaultButton text="🗄️ Template" /> */}
                {/* <TemplateMenu /> */}
            </Stack>

            <div className={css.editor}>
                <RichTextEditor
                    initialHTML=""
                    placeholder={<p>New progress note</p>}
                    onChange={onNotesChanged}
                />
            </div>
            {/* <div title="Minor notes are hidden in the timeline (by default)">
                <Checkbox label="Minor" />
            </div> */}
            {/* <ChangesPanel /> */}
            <Stack
                className={css.buttons}
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
