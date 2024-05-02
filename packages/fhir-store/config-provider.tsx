import React from "react";
import { Provider } from "react-redux";

import { createStore } from "./store";
import { EHRConfig } from "./config";
import { useFHIR } from "./fhir-state";
import { useFhirServerConfig } from "./fhir-server";

interface Props {
    config: EHRConfig;
    children: React.ReactNode;
}

export function EHRPageConfig(props: Props) {
    const serverConfig = useFhirServerConfig();

    const store = React.useMemo(() => {
        return createStore(props.config, serverConfig);
    }, [props.config, serverConfig]);

    return (
        <Provider store={store}>
            <Loader>{props.children}</Loader>
        </Provider>
    );
}

/**
 * Show loading screen while waiting for loadAllResources to complete
 * */
function Loader(props: { children: React.ReactNode }) {
    const showLoadingScreen = useFHIR((s) => s.fhir.showLoadingScreen);
    const showErrors = useFHIR((s) => s.fhir.showErrors);

    if (showErrors) {
        return <FHIRErrors />;
    }
    if (showLoadingScreen) {
        return <div style={{ margin: "2em" }}>Loading...</div>;
    }

    return props.children;
}

function FHIRErrors() {
    const state = useFHIR((s) => s.fhir.queries);

    const errors = Object.entries(state)
        .filter((entry) => entry[1].state === "error")
        .map((entry) => ({
            query: entry[0],
            error: entry[1].state === "error" && entry[1].error?.toString(),
        }));

    // output errors as json
    return (
        <div>
            <h1>FHIR errors</h1>
            <pre>{JSON.stringify(errors, null, 2)}</pre>
        </div>
    );
}
