import useSWR from "swr";
import { fetchFHIR } from "../../utils/fetcher";
import { ErrorMessage } from "../feedback/ErrorMessage";

interface Props {
    path: string;
}

function JSON(props: Props) {
    const { data, error } = useSWR(props.path, fetchFHIR);

    if (error) {
        return <ErrorMessage error={error} />;
    }
    if (!data) {
        return <div>Loading...</div>;
    }

    return <pre>{window.JSON.stringify(data, null, 2)}</pre>;
}

export const FHIR = {
    JSON,
};
