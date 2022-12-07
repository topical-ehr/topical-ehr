import * as FHIR from "./FhirTypes";
import { logsForModule } from "./logger";
import { minInputLengthForSearch } from "./settings";

export const SearchScope = {
  root: "isa/138875005",
  clinicalFinding: "isa/404684003",

  // medicinalProductUnitOfUse: "isa/30450011000036109",
  medicinalProductUnitOfUse: "refset/929360071000036103",

  timePatterns: "isa/272103003",
};

export type Term = FHIR.ValueSet["expansion"]["contains"][0];

const _log = logsForModule("FhirTerminology");

export async function loadOptionsFromTerminology<T>(
  input: string,
  searchScope: string,
  makeOption: (termType: string, term: Term) => T[] | undefined
): Promise<T[]> {
  const log = _log(loadOptionsFromTerminology, arguments);

  if (input.length < minInputLengthForSearch) {
    return [];
  }

  const vs = await searchTerminology(input, searchScope);

  function termToOptions(term: Term): T[] {
    const fullySpecifiedName = term.designation?.find(
      (d) => d.use?.code === "900000000000003001"
    )?.value;
    if (!fullySpecifiedName) {
      return [];
    }
    const termType = fullySpecifiedName?.slice(
      fullySpecifiedName.indexOf("(") + 1,
      -1
    );
    const options = makeOption(termType, term) ?? [];
    return options;
  }

  const options = vs.expansion?.contains?.flatMap(termToOptions) ?? [];
  return options;
}

export async function searchTerminology(
  input: string,
  searchScope: string
): Promise<FHIR.ValueSet> {
  const serverBaseUrl = "https://r4.ontoserver.csiro.au/fhir/";
  const codeSystemUrl = `http://snomed.info/sct?fhir_vs=${searchScope}`;

  const designation = encodeURIComponent(
    "http://snomed.info/sct|900000000000003001"
  );

  // TODO: designation filter doesn't seem to work
  const options = `_format=json&count=10&includeDesignations=true&designation=${designation}`;
  const filter = encodeURIComponent(input);
  const url = `${serverBaseUrl}ValueSet/$expand?filter=${filter}&url=${codeSystemUrl}&${options}`;

  const resp = await fetch(url);
  const vs: FHIR.ValueSet = await resp.json();
  console.log({ vs });
  return vs;
}
