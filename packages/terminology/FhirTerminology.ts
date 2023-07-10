import * as FHIR from "@topical-ehr/fhir-types";
import { logsFor } from "@topical-ehr/logging";

export const SearchScope = {
    root: "isa/138875005",
    clinicalFinding: "isa/404684003",

    // medicinalProductUnitOfUse: "isa/30450011000036109",
    medicinalProductUnitOfUse: "refset/929360071000036103",

    timePatterns: "isa/272103003",
};

export type Term = FHIR.ValueSet["expansion"]["contains"][0];

const log = logsFor("FhirTerminology");

export async function searchTerminology(serverBaseUrl: string, input: string, searchScope: string): Promise<FHIR.ValueSet> {
    const codeSystemUrl = `http://snomed.info/sct?fhir_vs=${searchScope}`;

    const designation = encodeURIComponent("http://snomed.info/sct|900000000000003001");

    // TODO: designation filter doesn't seem to work
    const options = `_format=json&count=10&includeDesignations=true&designation=${designation}`;
    const filter = encodeURIComponent(input);
    const url = `${serverBaseUrl}ValueSet/$expand?filter=${filter}&url=${codeSystemUrl}&${options}`;

    const resp = await fetch(url);
    const vs: FHIR.ValueSet = await resp.json();
    log.debug("searchTerminology", { input, url, vs });
    return vs;
}
