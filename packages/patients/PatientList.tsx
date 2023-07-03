import { DetailsList, DetailsListLayoutMode, IColumn, Link, SelectionMode } from "@fluentui/react";
import { PatientFormatter } from "../../utils/display/PatientFormatter";
import { useFHIR } from "@topical-ehr/fhir-store";

interface Props {
    filter: (patient: FHIR.Patient) => boolean;
}

function Filtered(props: Props) {
    const query = useFHIRQuery(`Patient`);
    const patients = useFHIR((s) => s.fhir.resources.patients);
    if (query.state === "error") {
        return <ErrorMessage error={query.error} />;
    }
    if (query.state === "loading") {
        return <Loading />;
    }

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
            const pf = new PatientFormatter(patient);
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
    return <Filtered filter={(patient) => new PatientFormatter(patient).name.includes("Ira")} />;
}

export const PatientList = {
    All,
    Recent,
    Filtered,
};
