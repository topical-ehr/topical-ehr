export const fetchFHIR = (path: string) => {
  const slash = path.startsWith("/") ? "" : "/";
  const url = `/fhir${slash}${path}`;

  return fetch(url).then((r) => r.json());
};
