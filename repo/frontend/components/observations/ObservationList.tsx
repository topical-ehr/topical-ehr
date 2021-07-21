import {
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    SearchBox,
    SelectionMode,
} from "@fluentui/react";
import { DateTime } from "luxon";
import React from "react";
import useSWR from "swr";
import { ObservationFormatter } from "../../utils/display/ObservationFormatter";
import { fetchFHIR } from "../../utils/fetcher";
import { Bundle, Observation } from "../../utils/FhirTypes";
import { ErrorMessage } from "../feedback/ErrorMessage";
import { Loading } from "../feedback/Loading";

interface Props {
    path: string;
    filter: (patient: Observation) => boolean;
}

function Filtered(props: Props) {
    const { data, error } = useSWR<Bundle<Observation>>(`${props.path}&_count=1000`, fetchFHIR);

    const [filter, setFilter] = React.useState<string | null>(null);

    if (error) {
        return <ErrorMessage error={error} />;
    }
    if (!data) {
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
    const items = data.entry
        .filter(
            (entry) =>
                props.filter(entry.resource) &&
                (!filterLC ||
                    new ObservationFormatter(entry.resource).code.toLowerCase().includes(filterLC))
        )
        .map((entry) => new ObservationFormatter(entry.resource))
        .sort((a, b) => (a.dateString ?? "").localeCompare(b.dateString ?? ""))
        .map((of) => {
            return {
                key: of.ob.id,
                date: of.date?.toLocaleString(DateTime.DATE_MED),
                code: of.code,
                value: of.value,
            };
        });

    function onItemInvoked(item) {
        console.log("onItemInvoked", item);
    }

    function onSearchChange(_event, newValue?: string) {
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

export function All({ path }: { path: string }) {
    return <Filtered path={path} filter={() => true} />;
}

export const ObservationList = {
    All,
    Filtered,
};
