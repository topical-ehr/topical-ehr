import * as FHIR from "../utils/FhirTypes";

const basePath = "/fhir";

export async function fetchFHIR(path: string) {
  const slash = path.startsWith("/") ? "" : "/";
  const url = `${basePath}${slash}${path}`;

  const response = await fetch(url);
  return await response.json();
}

export async function postFHIR(bundle: FHIR.Bundle<FHIR.Resource>) {
  const response = await fetch(basePath, {
    method: "POST",
    body: JSON.stringify(bundle, null, 2),
    headers: {
      "content-type": "application/fhir+json",
    },
  });
  return await response.json();
}
