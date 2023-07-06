import DOMPurify from "dompurify";
import React from "react";
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
import { bundleIcon, EditRegular, EditFilled } from "@fluentui/react-icons";

import * as FHIR from "@topical-ehr/fhir-types";
import { FhirSVG } from "@topical-ehr/ui-elements/FhirSVG";

import css from "./DocumentView.module.scss";
import { fhirTypeId } from "@topical-ehr/fhir-types/FhirUtils";
import { RichTextEditor } from "@topical-ehr/rich-text-editor";

const EditIcon = bundleIcon(EditFilled, EditRegular);

interface Props {
    document: FHIR.Composition;
}

export function DocumentView(props: Props) {
    const composition = props.document;
    const title = composition?.section?.[0].title;
    const html = composition?.section?.[0].text?.div ?? "";

    const [edit, setEdit] = React.useState(false);
    const [newHTML, setNewHTML] = React.useState("");

    function onSave() {
        onCancel();
    }

    function onCancel() {
        setNewHTML("");
        setEdit(false);
    }

    return (
        <div className={css.document}>
            <DocumentMenu
                {...props}
                setEdit={setEdit}
            />
            {title && <h4>{title}</h4>}
            {!edit && (
                <div
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }),
                    }}
                ></div>
            )}

            {edit && (
                <>
                    <RichTextEditor
                        initialHTML={html}
                        placeholder={<></>}
                        onChangedHTML={setNewHTML}
                    />
                    <div className={css.buttons}>
                        <Button
                            onClick={onSave}
                            disabled={!newHTML}
                            appearance="primary"
                        >
                            Save
                        </Button>
                        <Button onClick={onCancel}>Cancel</Button>
                    </div>
                </>
            )}
        </div>
    );
}

function DocumentMenu(props: Props & { setEdit: (edit: boolean) => void }) {
    return (
        <Menu>
            <MenuTrigger disableButtonEnhancement>
                <Tooltip
                    content="Open menu"
                    relationship="label"
                >
                    <MenuButton
                        shape="circular"
                        size="small"
                    />
                </Tooltip>
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    <MenuItem
                        icon={<EditIcon />}
                        onClick={() => props.setEdit(true)}
                    >
                        Edit
                    </MenuItem>
                    <MenuItemLink
                        href={`/edit-fhir?fhirUrl=${encodeURIComponent(fhirTypeId(props.document))}`}
                        target="_blank"
                        icon={<FhirSVG />}
                    >
                        FHIR editor
                    </MenuItemLink>
                </MenuList>
            </MenuPopover>
        </Menu>
    );
}
