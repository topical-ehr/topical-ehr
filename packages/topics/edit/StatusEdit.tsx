import { Dropdown, DropdownProps, Option } from "@fluentui/react-components";
import * as FHIR from "@topical-ehr/fhir-types";

import { actions } from "@topical-ehr/fhir-store";
import { useAppDispatch } from "@topical-ehr/fhir-store/store";
import { Codes } from "@topical-ehr/fhir-types/FhirCodes";
import { activeStatus } from "../Topic";
import { useTopicContext } from "../TopicContext";

interface Props {}

export function StatusEdit(props: Props) {
    const dispatch = useAppDispatch();
    const context = useTopicContext();
    const { composition } = context.topic;

    if (!context.editing) {
        return null;
    }

    function valueToCategory(value?: string) {
        if (value === "active") {
            return Codes.Composition.Category.Active;
        }
        if (value === "inactive") {
            return Codes.Composition.Category.Inactive;
        }

        return null;
    }

    const onOptionSelect: DropdownProps["onOptionSelect"] = (ev, data) => {
        const newCategory = valueToCategory(data.optionValue);
        if (newCategory) {
            const newCategories = (context.topic.composition.category ?? [])
                .filter(
                    // remove existing category
                    (c) => c.coding?.[0]?.system !== Codes.Composition.Category.Active.coding[0].system
                )
                .concat(newCategory);
            dispatch(
                actions.edit({
                    ...composition,
                    category: newCategories,
                } as FHIR.Resource)
            );
        }
    };

    const status = activeStatus(context.topic);

    return (
        <>
            <div>Status</div>
            <Dropdown
                placeholder="active/inactive"
                value={status}
                selectedOptions={[status]}
                onOptionSelect={onOptionSelect}
            >
                <Option value="active">active</Option>
                <Option value="inactive">inactive</Option>
            </Dropdown>
        </>
    );
}
