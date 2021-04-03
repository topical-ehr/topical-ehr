module PAT.FHIR.Libraries

open System
open PAT.FHIR.Urls

type LibraryType =
    | SubclinicMatching
    | TriggerRules
    | QuestionConditions

module PatLibraryIdentifiers =
    let systemUrl libraryType =
        let libraryTypeStr =
            match libraryType with
            | SubclinicMatching -> "Subclinic-Matching"
            | TriggerRules -> "Triggers"
            | QuestionConditions -> "QuestionConditions"

        patFhirUrl (sprintf "library/%s" libraryTypeStr)
