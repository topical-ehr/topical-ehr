import { useState } from "react";
import {
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    SearchBox,
    SelectionMode,
} from "@fluentui/react";
import { DateTime } from "luxon";
import { ObservationFormatter } from "../../utils/display/ObservationFormatter";
import { Observation } from "../../utils/FhirTypes";
import { ErrorMessage } from "../feedback/ErrorMessage";
import { Loading } from "../feedback/Loading";
import { useFHIR, useFHIRQuery } from "../../redux/FhirState";

interface Props {
    fhirQuery: string;
    filter: (patient: Observation) => boolean;
}

function Filtered(props: Props) {
    const [filter, setFilter] = useState<string | null>(null);

    const query = useFHIRQuery(props.fhirQuery);
    const observations = useFHIR((s) => s.fhir.resources.observations);

    if (query.state === "error") {
        return <ErrorMessage error={query.error} />;
    }
    if (query.state === "loading") {
        return <Loading />;
    }

    const columns: IColumn[] = [
        {
            key: "date",
            name: "Date",
            fieldName: "date",
            minWidth: 100,
            isResizable: true,
            flexGrow: 4,
        },
        {
            key: "code",
            name: "Code",
            fieldName: "code",
            minWidth: 100,
            isResizable: true,
            flexGrow: 20,
        },
        {
            key: "value",
            name: "Value",
            fieldName: "value",
            minWidth: 100,
            isResizable: true,
            flexGrow: 5,
        },
    ];

    const filterLC = filter?.toLowerCase();
    const items = [...Object.values(observations)]
        .filter(
            (ob) =>
                props.filter(ob) &&
                (!filterLC || new ObservationFormatter(ob).code.toLowerCase().includes(filterLC))
        )
        .map((ob) => new ObservationFormatter(ob))
        .sort((a, b) => (a.dateString ?? "").localeCompare(b.dateString ?? ""))
        .map((of) => {
            return {
                key: of.ob.id,
                date: of.date?.toLocaleString(DateTime.DATE_MED),
                code: of.code,
                value: of.value,
            };
        });

    function onItemInvoked(item?: any, index?: number, ev?: Event) {
        console.log("onItemInvoked", item);
    }

    function onSearchChange(event?: React.ChangeEvent<HTMLInputElement>, newValue?: string) {
        setFilter(newValue ?? null);
    }

    return (
        <div>
            <div style={{ marginLeft: "1em", marginRight: "1em" }}>
                <SearchBox
                    placeholder="Filter"
                    iconProps={{ iconName: "Filter" }}
                    onChange={onSearchChange}
                />
            </div>

            <DetailsList
                items={items}
                columns={columns}
                layoutMode={DetailsListLayoutMode.fixedColumns}
                selectionMode={SelectionMode.none}
                onItemInvoked={onItemInvoked}
                onShouldVirtualize={() => false /* virtualisation breaks Control-F */}
            />
        </div>
    );
}

export function All(props: { fhirQuery: string }) {
    return <Filtered fhirQuery={props.fhirQuery} filter={() => true} />;
}

export const ObservationList = {
    All,
    Filtered,
};
