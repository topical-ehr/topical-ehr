module PAT.Samples.Generator.FHIR.CareTeam

open Hl7.Fhir.Model

open PAT.FHIR.DotNetUtils
open PAT.FHIR.Codes


let create
    createResource
    ((patient: Resource), _)
    (specialityName: string)
    (snomedCode: string)
    (practitioner: Practitioner)
    =

    let epcExtension =
        Extension(PAT.FHIR.Extensions.PatExtensions.Urls.AlliedHealthEPCMedicareVisitCount, Integer(N 1))

    let careTeam =
        CareTeam(
            Subject = referenceToResource patient,
            Status = N CareTeam.CareTeamStatus.Active,
            Category =
                L [ PatCodes.CareTeam.Categories.LongitudinalCareCoordination
                    PatCodes.CareTeam.Categories.LongitudinalCareCoordinationNoText ],
            Participant =
                L [ CareTeam.ParticipantComponent(
                        Role =
                            L [ CodeableConcept(
                                    Coding = L [ Coding("http://snomed.info/sct", snomedCode, specialityName) ],
                                    Text = specialityName
                                ) ],
                        Extension =
                            (if practitioner = null then
                                 (L())
                             else
                                 (L [ epcExtension ])),
                        Member =
                            if practitioner = null then
                                null
                            else
                                referenceToResource practitioner
                    ) ]

        )

    let careTeamNoSubject = // e.g. whole-practise Practice Nurse careteam
        CareTeam(
            Status = N CareTeam.CareTeamStatus.Active,
            Identifier = L [ PatCodes.CareTeam.Identifiers.MultiPatientCareTeam "practice-nurse" ],
            Category =
                L [ PatCodes.CareTeam.Categories.LongitudinalCareCoordination
                    PatCodes.CareTeam.Categories.LongitudinalCareCoordinationNoText ],
            Participant =
                L [ CareTeam.ParticipantComponent(
                        Role =
                            L [ CodeableConcept(
                                    Coding = L [ Coding("http://snomed.info/sct", snomedCode, specialityName) ],
                                    Text = specialityName
                                ) ],
                        Extension =
                            (if practitioner = null then
                                 (L())
                             else
                                 (L [ epcExtension ])),
                        Member =
                            if practitioner = null then
                                null
                            else
                                referenceToResource practitioner
                    ) ]

        )

    createResource careTeamNoSubject |> ignore
    let created = createResource careTeam
    created
///created :> Resource
//careTeam :> Resource
