module PAT.Samples.Generator.FHIR.CarePlans

open System

open Hl7.Fhir.Support
open Hl7.Fhir.Model

open PAT.FHIR.DotNetUtils
open PAT.FHIR.Codes
open PAT.FHIR.Urls

type SampleContext =
    {
        patient: Resource
        encounter: Resource
        planDefinition: Resource
        activityDefinitionRef: ResourceReference

        practitionerGP: Resource
        careteamForPharmacists: Resource
    }

let makeCarePlans (context: SampleContext) =

    let time =
        DateTime
            .Parse("2017-01-01T14:00:00")
            .ToUniversalTime()
            .ToFhirDateTime()

    let careplans =
        seq {

            yield
                CarePlan(
                    InstantiatesCanonical = L [ canonicalUrlForResource context.planDefinition ],
                    Status = N RequestStatus.Active,
                    Intent = N CarePlan.CarePlanIntent.Plan,
                    Category =
                        L [ PatCodes.CarePlan.Category.PatChronicDiseaseManagement
                            PatCodes.CarePlan.Category.PatChronicDiseaseManagementNoText ],
                    Title = "General GPMP Management Plan",
                    Description = "",
                    Subject = referenceToResource context.patient,
                    Encounter = referenceToResource context.encounter,
                    Author = referenceToResource context.practitionerGP,
                    Extension =
                        L [ Extension(
                                PAT.FHIR.Extensions.PatExtensions.Urls.ActivityTriggeredButDeleted,
                                FhirString(Guid().ToString())
                            )
                            Extension(PAT.FHIR.Extensions.PatExtensions.Urls.CarePlanCreated, FhirDateTime.Now()) ],
                    Activity =
                        L [ CarePlan.ActivityComponent(
                                Detail =
                                    CarePlan.DetailComponent(
                                        InstantiatesCanonical = L [ string context.activityDefinitionRef ],
                                        Code =
                                            CodeableConcept(
                                                Coding =
                                                    L [ Coding(
                                                            KnownUrls.patGoalId,
                                                            "B5B21335-731C-4F1B-9D82-84EBD19D22CD"
                                                        ) ],
                                                Text = "'Problem field' goes here"
                                            ),
                                        ReasonCode = L [ CodeableConcept(Text = "'Goal' field goes here") ],
                                        Description = "Management plan goes here",
                                        Status = N CarePlan.CarePlanActivityStatus.NotStarted,
                                        Performer = L [ referenceToResource context.careteamForPharmacists ],
                                        Scheduled = Period(Start = time)
                                    ),
                                Progress =
                                    L [ Annotation(
                                            Text = Markdown "Comment 1 for a CarePlan activity",
                                            Time = time,
                                            Author = referenceToResource context.practitionerGP
                                        ) ]
                            )
                            CarePlan.ActivityComponent(
                                Detail =
                                    CarePlan.DetailComponent(
                                        Code =
                                            CodeableConcept(
                                                Coding =
                                                    L [ Coding(
                                                            KnownUrls.patGoalId,
                                                            "New-B5B21335-731C-4F1B-9D82-84EBD19D22CD"
                                                        ) ],
                                                Text =
                                                    "'Problem field' goes here for a newly added activity not based on an ActivityDefinition"
                                            ),
                                        ReasonCode = L [ CodeableConcept(Text = "'Goal' field goes here") ],
                                        Description = "Management plan goes here",
                                        Status = N CarePlan.CarePlanActivityStatus.InProgress,
                                        StatusReason = CodeableConcept(Text = "Referred"),
                                        Performer = L [ referenceToResource context.careteamForPharmacists ],
                                        Extension =
                                            L [ Extension(
                                                    PAT.FHIR.Extensions.PatExtensions.Urls.ActivityAddedUnder,
                                                    FhirString("patient-section")
                                                )
                                                Extension(
                                                    PAT.FHIR.Extensions.PatExtensions.Urls.CLINICAL_CATEGORY,
                                                    FhirString("general")
                                                ) ]
                                    ),
                                Progress =
                                    L [ Annotation(
                                            Text = Markdown "Comment 1 for a CarePlan activity",
                                            Time = time,
                                            Author = referenceToResource context.practitionerGP
                                        ) ]
                            )
                            CarePlan.ActivityComponent(
                                Detail =
                                    CarePlan.DetailComponent(
                                        Code =
                                            CodeableConcept(
                                                Coding =
                                                    L [ Coding(KnownUrls.patGoalId, "New-with-bad-UUID-and-no-text") ]
                                            ),
                                        Status = N CarePlan.CarePlanActivityStatus.InProgress,
                                        Performer = L [ referenceToResource context.careteamForPharmacists ],
                                        Extension =
                                            L [ Extension(
                                                    PAT.FHIR.Extensions.PatExtensions.Urls.ActivityAddedUnder,
                                                    FhirString("patient-section")
                                                )
                                                Extension(
                                                    PAT.FHIR.Extensions.PatExtensions.Urls.CLINICAL_CATEGORY,
                                                    FhirString("general")
                                                ) ]
                                    ),
                                Progress =
                                    L [ Annotation(
                                            Text = Markdown "Comment 1 for a CarePlan activity",
                                            Time = time,
                                            Author = referenceToResource context.practitionerGP
                                        ) ]
                            ) ],
                    Note =
                        L [ Annotation(
                                Text = Markdown "Comment 1",
                                Time = time,
                                Author = referenceToResource context.practitionerGP
                            ) ]
                )
        }

    careplans |> List.ofSeq
