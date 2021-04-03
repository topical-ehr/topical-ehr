module PAT.FHIR.ValueSets

open System
open Hl7.Fhir.Support
open Hl7.Fhir.Model
open PAT.FHIR.Urls
open PAT.FHIR.DotNetUtils

type QuestionTypeValueSets =
    {
        YesNo: string
        YesNoUnsure: string
        YesNoNaUnsure: string
    }

let identifiers =
    {
        YesNo = "PAT-YesNo"
        YesNoUnsure = "PAT-YesNoUnsure"
        YesNoNaUnsure = "PAT-YesNoNaUnsure"
    }

let createQuestionAnswerValueSets =
    seq {
        yield
            ValueSet(
                Identifier = L [ makeStaticIdentifier identifiers.YesNo ],
                Purpose = Markdown("ValueSet for PAT Questionnaire answers (Yes / No)"),
                Status = N PublicationStatus.Active,
                Compose =
                    ValueSet.ComposeComponent(
                        Include =
                            L [ ValueSet.ConceptSetComponent(
                                    ValueSet =
                                        [
                                            "http://hl7.org/fhir/ValueSet/v2-0136"
                                        ]
                                ) ]
                    )
            )

        yield
            ValueSet(
                Identifier = L [ makeStaticIdentifier identifiers.YesNoUnsure ],
                Purpose = Markdown("ValueSet for PAT Questionnaire answers (Yes / No / Unsure)"),
                Status = N PublicationStatus.Active,
                Compose =
                    ValueSet.ComposeComponent(
                        Include =
                            L [ ValueSet.ConceptSetComponent(
                                    ValueSet =
                                        [
                                            "http://hl7.org/fhir/ValueSet/v2-0136"
                                        ]
                                )
                                ValueSet.ConceptSetComponent(
                                    System = "http://hl7.org/fhir/v3/NullFlavor",
                                    Concept = L [ ValueSet.ConceptReferenceComponent(Code = "UNK") ]
                                ) ]
                    )
            )

        yield
            ValueSet(
                Identifier = L [ makeStaticIdentifier identifiers.YesNoNaUnsure ],
                Purpose = Markdown("ValueSet for PAT Questionnaire answers (Yes / No / NA / Unsure)"),
                Status = N PublicationStatus.Active,
                Compose =
                    ValueSet.ComposeComponent(
                        Include =
                            L [ ValueSet.ConceptSetComponent(
                                    ValueSet =
                                        [
                                            "http://hl7.org/fhir/ValueSet/v2-0136"
                                        ]
                                )
                                ValueSet.ConceptSetComponent(
                                    System = "http://hl7.org/fhir/v3/NullFlavor",
                                    Concept = L [ ValueSet.ConceptReferenceComponent(Code = "NA") ]
                                )
                                ValueSet.ConceptSetComponent(
                                    System = "http://hl7.org/fhir/v3/NullFlavor",
                                    Concept = L [ ValueSet.ConceptReferenceComponent(Code = "UNK") ]
                                ) ]
                    )
            )
    }
