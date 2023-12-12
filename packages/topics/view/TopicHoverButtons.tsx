import { actions } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import {
    HoverButtonDelete,
    HoverButtonEdit,
    HoverButtonFHIR,
    HoverButtonUndo,
    HoverButtons,
} from "@topical-ehr/ui-elements/HoverButtons";
import { useTopicContext } from "../TopicContext";
import {
    Menu,
    MenuTrigger,
    MenuButton,
    MenuPopover,
    MenuList,
    MenuItem,
    MenuItemLink,
    Tooltip,
} from "@fluentui/react-components";
import { fhirTypeId } from "@topical-ehr/fhir-types/FhirUtils";
import { FhirSVG } from "@topical-ehr/ui-elements/FhirSVG";
import { EditIcon, DeleteIcon, UndoIcon } from "@topical-ehr/ui-elements/Icons";

interface Props {}

export function TopicHoverButtons(props: Props) {
    const dispatch = useAppDispatch();
    const context = useTopicContext();
    const { editing } = context;

    function onEdit() {
        dispatch(actions.edit(context.topic.composition));
    }

    return (
        <div>
            <HoverButtons>
                {!editing && <HoverButtonEdit onClick={onEdit} />}
                {editing && <TopicEditMenu />}
            </HoverButtons>
        </div>
    );
}

function TopicEditMenu() {
    const dispatch = useAppDispatch();
    const context = useTopicContext();

    function onDelete() {
        dispatch(actions.delete(context.topic.composition));
    }
    function onUndo() {
        dispatch(actions.undoEdits(context.topic.composition));
    }

    return (
        <Menu>
            <MenuTrigger disableButtonEnhancement>
                <Tooltip
                    content="Open menu"
                    relationship="label"
                >
                    <MenuButton
                        shape="circular"
                        // size="small"
                        style={{ marginLeft: "0.5em" }}
                    />
                </Tooltip>
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    <MenuItem
                        icon={<UndoIcon />}
                        onClick={onUndo}
                    >
                        Undo all edits
                    </MenuItem>
                    <MenuItem
                        icon={<DeleteIcon />}
                        onClick={onDelete}
                    >
                        Delete
                    </MenuItem>
                    <MenuItemLink
                        href={`/edit-fhir?fhirUrl=${encodeURIComponent(fhirTypeId(context.topic.composition))}`}
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
