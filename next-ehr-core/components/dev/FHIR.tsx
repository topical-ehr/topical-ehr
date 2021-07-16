import React from "react";
import useSWR from "swr";
import { fetcher } from "../../utils/fetcher";
import { ErrorMessage } from "../feedback/ErrorMessage";

interface Props {
  path: string;
}

function JSON(props: Props) {
  const slash = props.path.startsWith("/") ? "" : "/";
  const { data, error } = useSWR(`/fhir${slash}${props.path}`, fetcher);

  if (error) {
    return <ErrorMessage error={error} />;
  }
  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <pre style={{ marginLeft: "1em" }}>
      {window.JSON.stringify(data, null, 2)}
    </pre>
  );
}

export const FHIR = {
  JSON,
};
