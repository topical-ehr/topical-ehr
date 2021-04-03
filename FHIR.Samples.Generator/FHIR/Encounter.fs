﻿module PAT.Samples.Generator.FHIR.Encounter

open Hl7.Fhir.Model
open PAT.FHIR.DotNetUtils
open PAT.FHIR.Codes
open PAT.FHIR.Extensions

type NeedsSubclinicSelection = NeedsSubclinicSelection of bool
type IsFinished = IsFinished of bool

let create
    createResource
    (NeedsSubclinicSelection needsSubclinicSelection)
    (IsFinished isFinished)
    ((patient: Resource), _)
    (nurse: Practitioner)
    =

    let encounter =
        Encounter(
            Subject = referenceToResource patient,
            Status =
                N(
                    if isFinished then
                        Encounter.EncounterStatus.Finished
                    else
                        Encounter.EncounterStatus.InProgress
                ),
            Extension =
                L [ Extension(
                        PatExtensions.Urls.Encounter.NeedsSubclinicSelection,
                        FhirBoolean(N needsSubclinicSelection)
                    )
                    Extension(PatExtensions.Urls.Encounter.LabResultsLoaded, FhirBoolean(N true)) ],
            Class = Coding("http://hl7.org/fhir/v3/ActCode", "AMB"), // http://build.fhir.org/v3/ActEncounterCode/vs.html
            Type =
                L [ PatCodes.EncounterTypes.OnSiteClinic
                    PatCodes.EncounterTypes.OnSiteClinicWithText ],
            Period =
                Period(
                    StartElement = FhirDateTime(2017, 10, 1, 9, 30),
                    EndElement =
                        if isFinished then
                            FhirDateTime(2017, 10, 1, 10, 55)
                        else
                            null
                ),
            Contained =
                L [ Condition(
                        Id = "CurrentCondition1",
                        ClinicalStatus = N Condition.ConditionClinicalStatusCodes.Active,
                        VerificationStatus = N Condition.ConditionVerificationStatus.Confirmed,
                        Subject = referenceToResource patient,
                        Code = (CodeableConcept(Text = "current condition 1")),
                        Note = L [ Annotation(Text = "comment for current condition") ]
                    )
                    :> Resource
                    Condition(
                        Id = "CurrentCondition2",
                        ClinicalStatus = N Condition.ConditionClinicalStatusCodes.Active,
                        VerificationStatus = N Condition.ConditionVerificationStatus.Confirmed,
                        Subject = referenceToResource patient,
                        Code = (CodeableConcept(Text = "current condition 2")),
                        Note = L [ Annotation(Text = "comment for current condition") ]
                    )
                    :> Resource ],
            Participant =
                L [ Encounter.ParticipantComponent(
                        Type =
                            L [ CodeableConcept(
                                    "http://hl7.org/fhir/v3/ParticipationType",
                                    "ATND",
                                    "attender",
                                    "treating nurse"
                                ) ],
                        Individual =
                            ResourceReference(
                                Reference = (sprintf "%s/%s" nurse.TypeName nurse.Id),
                                Display =
                                    (nurse.Name.[0].GivenElement.[0].Value)
                                    + " "
                                    + (nurse.Name.[0].FamilyElement.Value)
                            )
                    ) ],
            Diagnosis =
                L [ Encounter.DiagnosisComponent(Condition = ResourceReference("#CurrentCondition1"))
                    Encounter.DiagnosisComponent(Condition = ResourceReference("#CurrentCondition2")) ]
        )

    createResource encounter
