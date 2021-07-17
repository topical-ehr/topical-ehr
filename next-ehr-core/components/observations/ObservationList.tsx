import { DetailsList, DetailsListLayoutMode, IColumn, Link, SelectionMode } from "@fluentui/react";
import React from "react";
import useSWR from "swr";
import { ObservationFormatter } from "../../utils/display/ObservationFormatter";
import { fetcher } from "../../utils/fetcher";

import { Bundle, Observation } from "../../utils/FhirTypes";

import { ErrorMessage } from "../feedback/ErrorMessage";

interface Props {
  path: string;
  filter: (patient: Observation) => boolean;
}

function Filtered(props: Props) {
  const { data, error } = useSWR<Bundle<Observation>>(`${props.path}&_count=1000`, fetcher);

  if (error) {
    return <ErrorMessage error={error} />;
  }
  if (!data) {
    return <div>Loading...</div>;
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
    },
  ];

  const items = data.entry
    .filter((e) => props.filter(e.resource))
    .map(({ resource: observation }, i) => {
      const of = new ObservationFormatter(observation);
      return {
        key: observation.id,
        index: i,
        date: of.date,
        code: of.code,
        value: of.value,
      };
    });

  function onItemInvoked(item) {
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

export function All({ path }: { path: string }) {
  return <Filtered path={path} filter={() => true} />;
}

export const ObservationList = {
  All,
  Filtered,
};
