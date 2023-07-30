import React from "react";
import * as FHIR from "@topical-ehr/fhir-types";

export interface Config {
    minInputLengthForSearch: number;
    searchTerminology(input: string, searchScope: string): Promise<FHIR.ValueSet>;
}

export const AutocompleteConfigData = React.createContext<Config | null>(null);

export function useAutocompleteConfig() {
    return React.useContext(AutocompleteConfigData)!; // !: assume AutocompleteConfig is set to reduce null checks..
}

interface Props {
    config: Config;
    children: React.ReactNode;
}

export function AutocompleteConfig(props: Props) {
    return <AutocompleteConfigData.Provider value={props.config}>{props.children}</AutocompleteConfigData.Provider>;
}
