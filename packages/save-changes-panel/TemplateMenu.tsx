import {
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Tooltip,
} from "@fluentui/react-components";

import {
    DocumentBulletListFilled,
    DocumentBulletListRegular,
    EditFilled,
    EditRegular,
    bundleIcon,
} from "@fluentui/react-icons";

export const EditIcon = bundleIcon(EditFilled, EditRegular);

export function TemplateMenu() {
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

const DocumentBulletListIcon = bundleIcon(DocumentBulletListFilled, DocumentBulletListRegular);

function TemplateMenuItem(props: { text: string }) {
    return <MenuItem icon={<DocumentBulletListIcon />}>{props.text}</MenuItem>;
}
