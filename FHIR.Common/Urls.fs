module NextEHR.FHIR.Urls

open System

// URL schemas
let nextehrFhirUrl s =
    "https://metadata.next-ehr.org/v1.0/FHIR/" + s

let codeSystemGuidToUrl (guid: Guid) =
    nextehrFhirUrl "codeSystem/uuid/"
    + guid.ToString()

let guidToQuestionUrl (guid: Guid) =
    nextehrFhirUrl "question/uuid/" + guid.ToString()

let guidToQuestionDataElementUrl (guid: Guid) =
    nextehrFhirUrl "question/DataElement/uuid/"
    + guid.ToString()

let guidToProblemUrl (guid: Guid) =
    nextehrFhirUrl "problem/uuid/" + guid.ToString()

let guidToEducationUrl (guid: Guid) =
    nextehrFhirUrl "education/uuid/" + guid.ToString()

module KnownUrls =
    let codesystemOrdinalValue =
        "http://hl7.org/fhir/StructureDefinition/codesystem-ordinalValue"

    let codesystemConceptOrder =
        "http://hl7.org/fhir/StructureDefinition/codesystem-conceptOrder"

    let cqifLibrary =
        "http://hl7.org/fhir/StructureDefinition/cqif-library"
