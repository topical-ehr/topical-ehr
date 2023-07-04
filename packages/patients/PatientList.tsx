import { DetailsList, DetailsListLayoutMode, IColumn, Link, SelectionMode } from "@fluentui/react";
import { useFHIR } from "@topical-ehr/fhir-store";
import * as FHIR from "@topical-ehr/fhir-types";
import { useFormatting } from "@topical-ehr/formatting/formatting";

interface Props {
    filter: (patient: FHIR.Patient) => boolean;
}

function Filtered(props: Props) {
    const patients = useFHIR((s) => s.fhir.resources.patients);

    const formatting = useFormatting();

    const columns: IColumn[] = [
        {
            key: "index",
            name: "",
            fieldName: "index",
            minWidth: 3,
            maxWidth: 12,
            isResizable: true,
            onRender(item) {
                return item.index;
            },
        },
        {
            key: "name",
            name: "Name",
            fieldName: "name",
            minWidth: 100,
            isResizable: true,
            onRender(item) {
                return <Link href={`/patient/${item.key}`}>{item.name}</Link>;
            },
        },
        {
            key: "DOB",
            name: "DOB",
            fieldName: "dob",
            minWidth: 100,
            isResizable: true,
        },
    ];

    const items = [...Object.values(patients)]
        .filter((p) => props.filter(p))
        .map((patient, i) => {
            const pf = formatting.patient(patient);
            return {
                key: patient.id,
                index: i,
                name: pf.name,
                dob: pf.dateOfBirth,
            };
        });

    function onItemInvoked(item?: any, index?: number, ev?: Event) {
        console.log("onItemInvoked", item);
    }

    return (
        <DetailsList
            items={items}
            columns={columns}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
            onItemInvoked={onItemInvoked}
            onShouldVirtualize={() => false /* virtualisation breaks Control-F */}
        />
    );
}

export function All() {
    return <Filtered filter={() => true} />;
}

export function Recent() {
    const formatting = useFormatting();
    return <Filtered filter={(patient) => formatting.patient(patient).name.includes("Ira")} />;
}

export const PatientList = {
    All,
    Recent,
    Filtered,
};
