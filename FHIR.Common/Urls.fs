module PAT.FHIR.Urls

open System

// URL schemas
let patFhirUrl s =
    "https://metadata.patsoftware.com.au/v3.0/FHIR/"
    + s

let codeSystemGuidToUrl (guid: Guid) =
    patFhirUrl "codeSystem/uuid/" + guid.ToString()

let guidToQuestionUrl (guid: Guid) =
    patFhirUrl "question/uuid/" + guid.ToString()

let guidToQuestionDataElementUrl (guid: Guid) =
    patFhirUrl "question/DataElement/uuid/"
    + guid.ToString()

let guidToProblemUrl (guid: Guid) =
    patFhirUrl "problem/uuid/" + guid.ToString()

let guidToEducationUrl (guid: Guid) =
    patFhirUrl "education/uuid/" + guid.ToString()

module Identifiers =
    let patquestionnaireImage = patFhirUrl "media/questionnaire-image"

module KnownUrls =
    let codesystemOrdinalValue =
        "http://hl7.org/fhir/StructureDefinition/codesystem-ordinalValue"

    let codesystemConceptOrder =
        "http://hl7.org/fhir/StructureDefinition/codesystem-conceptOrder"

    let cqifLibrary =
        "http://hl7.org/fhir/StructureDefinition/cqif-library"

    let patCodeSystemIdentifierSystem = patFhirUrl "codeSystem"
    let patValueSetIdentifierSystem = patFhirUrl "valueSet"

    let patGoalId = patFhirUrl "goalId"
