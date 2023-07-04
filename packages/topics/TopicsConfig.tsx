import React from "react";
import * as FHIR from "@topical-ehr/fhir-types";

export interface Config {
    minInputLengthForSearch: number;
    searchTerminology(input: string, searchScope: string): Promise<FHIR.ValueSet>;
}

export const TopicsConfigData = React.createContext<Config | null>(null);

export function useTopicsConfig() {
    return React.useContext(TopicsConfigData)!; // !: assume TopicsConfig is set to reduce null checks..
}

interface Props {
    config: Config;
    children: React.ReactNode;
}

export function TopicsConfig(props: Props) {
    return <TopicsConfigData.Provider value={props.config}>{props.children}</TopicsConfigData.Provider>;
}
