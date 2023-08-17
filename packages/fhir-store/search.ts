import { FhirResources } from "./fhir-state";

export function createSearcher(searchString: string | null) {
    // very basic case-insensitive search of all string values of an object

    if (!searchString) {
        return () => true;
    }

    const searchTerms = searchString
        .split(/\W/)
        .filter((str) => str)
        .map((str) => new RegExp(str, "i"));

    if (searchTerms.length === 0) {
        return () => true;
    }

    function checkFilter(value: unknown) {
        switch (typeof value) {
            case "string":
                return searchTerms.every((term) => value.match(term));
            case "object":
                return !!value && Object.values(value).some(checkFilter);
            default:
                return false;
        }
    }

    return checkFilter;
}

export function searchResources(resources: FhirResources, searchString: string): FhirResources {
    // very basic case-insensitive search of all string values of an object

    const searchTerms = searchString
        .split(/\W/)
        .filter((str) => str)
        .map((str) => new RegExp(str, "i"));

    if (searchTerms.length === 0) {
        return resources;
    }

    function checkFilter(value: unknown) {
        switch (typeof value) {
            case "string":
                return searchTerms.every((term) => value.match(term));
            case "object":
                return value && Object.values(value).some(checkFilter);
            default:
                return false;
        }
    }

    const newEntries = Object.entries(resources).map(([resourceType, byId]) => {
        const filteredById = Object.fromEntries(Object.entries(byId).filter(([id, resource]) => checkFilter(resource)));
        return [resourceType, filteredById];
    });

    const result = Object.fromEntries(newEntries);
    debugger;
    return result;
}
