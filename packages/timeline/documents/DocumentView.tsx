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
import { bundleIcon, DeleteRegular, DeleteFilled, EditRegular, EditFilled } from "@fluentui/react-icons";

import * as FHIR from "@topical-ehr/fhir-types";
import { FhirSVG } from "@topical-ehr/ui-elements/FhirSVG";

import css from "./DocumentView.module.scss";
import { fhirTypeId } from "@topical-ehr/fhir-types/FhirUtils";
import { GetRichTextContents, RichTextEditor } from "@topical-ehr/rich-text-editor";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import { actions } from "@topical-ehr/fhir-store";

const EditIcon = bundleIcon(EditFilled, EditRegular);
const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular);

interface Props {
    document: FHIR.Composition;
}

export function DocumentView(props: Props) {
    const composition = props.document;
    const title = composition?.section?.[0].title;
    const html = composition?.section?.[0].text?.div ?? "";

    const [edit, setEdit] = React.useState(false);
    const [getRichTextContents, setGetRichTextContents] = React.useState<GetRichTextContents | null>(null);

    const dispatch = useAppDispatch();

    function onSave() {
        const newComposition = getRichTextContents
            ? FHIR.Composition.setText(getRichTextContents(), composition)
            : composition;

        dispatch(actions.edit(newComposition));
        dispatch(
            actions.save({
                // only save this new composition
                filter: (res) => FHIR.isSameId(res, newComposition),
            })
        );
        onCancel();
    }

    function onDelete() {
        dispatch(actions.deleteImmediately(composition));
    }

    function onCancel() {
        setEdit(false);
    }

    return (
        <div className={css.document}>
            <DocumentMenu
                {...props}
                setEdit={setEdit}
                delete={onDelete}
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
                        onChange={setGetRichTextContents}
                    />
                    <div className={css.buttons}>
                        <Button
                            onClick={onSave}
                            disabled={!getRichTextContents}
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

interface MenuProps {
    setEdit: (edit: boolean) => void;
    delete: () => void;
}

function DocumentMenu(props: Props & MenuProps) {
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
                    <MenuItem
                        icon={<DeleteIcon />}
                        onClick={props.delete}
                    >
                        Delete
                    </MenuItem>
                    <MenuItemLink
                        href={`/edit-fhir?fhirUrl=${encodeURIComponent(fhirTypeId(props.document))}`}
                        target="_blank"
                        icon={<FhirSVG />}
                    >
                        FHIR
                    </MenuItemLink>
                </MenuList>
            </MenuPopover>
        </Menu>
    );
}
