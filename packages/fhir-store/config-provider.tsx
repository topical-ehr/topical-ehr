import { Provider } from "react-redux";

import { createStore } from "./store";
import { EHRConfig } from "./config";
import { useFHIR } from "./fhir-state";

interface Props {
    config: EHRConfig;
    children: React.ReactNode;
}

export function EHRConfig(props: Props) {
    const store = React.useMemo(() => {
        return createStore(props.config);
    }, [props.config]);

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
    const state = useFHIR((s) => s.fhir.queries);
    const isLoading = Object.values(state).some((q) => q.state === "loading" && q.showLoadingScreen);

    if (isLoading) {
        return <div>Loading...</div>;
    } else {
        return props.children;
    }
}
