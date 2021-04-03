module PAT.Samples.Generator.Main

open System

open Hl7.Fhir.Rest
open Hl7.Fhir.Model

open PAT.FHIR.DotNetUtils
open PAT.Samples.Generator.FHIR.CarePlans
open PAT.FHIR.Codes


let recreatePatients CR fhir onlyDeleteSamples =
    [ "Patient" ]
    |> Utils.deleteResources fhir onlyDeleteSamples

    let count = 10

    for index in Seq.init count id do
        if index % 1000 = 0 then
            printfn "insertPatientsFromBogus: inserting patient %d" index

        let patient = FHIR.Patients.createFromBogus CR

        if index < 5 then
            FHIR.Observation.create CR patient |> ignore

    let patientsFromCSV =
        FHIR.Patients.createPatientsFromCSV CR
        |> Seq.toList

    FHIR.Patients.createAdHocPatient CR |> ignore
    patientsFromCSV


[<EntryPoint>]
let main argv =
    printfn "PAT.Samples.Generator: args: %A" argv
    let haveArg arg = Array.contains arg argv

    let getEnv =
        Environment.GetEnvironmentVariable >> Option.ofObj

    Bogus.Randomizer.Seed <- Random(7777777)
    let faker = Bogus.Faker()

    let fhirEndpointUrl =
        getEnv "FHIR_BASE_URL"
        |> Option.defaultValue "http://work-kube:3001/db/pat_samples_fhir"

    let fhir =
        new FhirClient(fhirEndpointUrl, verifyFhirVersion = false)

    fhir.PreferredFormat <- ResourceFormat.Json
    fhir.ParserSettings.AcceptUnknownMembers <- true // FIXME: remove once figure out what's going on
    fhir.ParserSettings.AllowUnrecognizedEnums <- true

    let CR (resource: #Resource) =
        printfn "Creating resource %s..." (resource.ResourceType.ToString())
        let start = System.Diagnostics.Stopwatch()
        start.Start()
        setTag resource PatCodes.Tags.PatVersion
        setTag resource PatCodes.Tags.PatSampleData
        let created = fhir.Create(resource)
        //printfn " done in %d ms" start.ElapsedMilliseconds
        created

    let DR (resourceType: string) (criteria: string []) =
        Utils.findAndDelete fhir criteria resourceType

    let onlyDeleteSamples = true

    let patientsFromCSV =
        recreatePatients CR fhir onlyDeleteSamples

    FHIR.Contacts.insertPractitionersFromBogus CR
    FHIR.Contacts.insertOrganizationsFromBogus CR
    FHIR.AuditEvent.create CR

    // Users
    if haveArg "--deleteSamples" then

        let onlyDeleteSamples =
            getEnv "ONLY_DELETE_SAMPLES"
            |> Option.map (fun s -> s = "true")
            |> Option.defaultValue false

        let toDelete =
            [
                "Observation"
                "Procedure"
                "DocumentReference"
                "Task"
                "CarePlan"
                "QuestionnaireResponse"
                "CareTeam"

                "Encounter"
                "Condition"

                "HealthcareService"
                "Organization"
            ]

        Utils.deleteResources fhir onlyDeleteSamples toDelete

        [ "Practitioner"; "PractitionerRole" ]
        |> Utils.deleteResources fhir false


    let doctor = FHIR.Practitioners.createDoctor CR
    let nurse = FHIR.Practitioners.createNurse CR
    let admin = FHIR.Practitioners.createAdmin CR
    let pharmacist = FHIR.Practitioners.createPharmacist CR

    let gpmpClinicGuid = "13885b18-d54c-4ce1-ba4c-4e2509c9fabf"

    // custom goals
    let doctor = FHIR.Practitioners.createDoctor CR

    let customGoal =
        let bpOutsideRangeGoal = "a612247a-6351-4ab0-a793-1ae94352a766"

        let basedOn =
            let bundle =
                fhir.Search<ActivityDefinition>(
                    [|
                        "identifier=urn:uuid:" + bpOutsideRangeGoal
                    |]
                )

            bundle.Entry.[0].Resource :?> ActivityDefinition
            |> Some

        let useWithClinics =
            let bundle =
                fhir.Search<PlanDefinition>([| "identifier=" + gpmpClinicGuid |])

            [
                (bundle.Entry.[0].Resource :?> PlanDefinition)
            ]

        FHIR.ActivityDefinitions.createCustomGoal
            CR
            DR
            {
                name = "Custom Goal 1"
                goal = "custom goal 1"
                plan = "custom plan 1"
                uuid = "5A63252C-48DF-4281-A676-11D7CB04504D"

                basedOn = basedOn
                autoReplaceDerivedFrom = true
                useWithClinics = useWithClinics
                author = doctor
                priv = false
                dateModified = DateTime(2018, 9, 15)
            }
            admin
        |> ignore


    let IsFinished = FHIR.Encounter.IsFinished
    let NeedsSubclinicSelection = FHIR.Encounter.NeedsSubclinicSelection
    let answerAll = 1.0f
    let answerHardcoded = 0.01f
    let answerNone = 0.0f

    let sleepCareplan =
        let patient = patientsFromCSV.[0]

        let encounter =
            FHIR.Encounter.create CR (NeedsSubclinicSelection true) (IsFinished true) patient nurse

        FHIR.CareTeam.create CR patient "Nurse" "106292003" null
        |> ignore

        let clinicGuid = "51780bd4-3c9a-446c-86fd-f9cad0aa6501" // sleep clinic
        let clinicIdentifier = sprintf "identifier=%s" clinicGuid

        let questionnaireBundle =
            fhir.Search<Questionnaire>([| clinicIdentifier |])

        if questionnaireBundle.Entry.Count = 0 then
            printfn "cannot find Questionnaire with %s" clinicIdentifier
        else
            let planDefinitionBundle =
                fhir.Search<PlanDefinition>([| clinicIdentifier |])

            if planDefinitionBundle.Entry.Count <> 1 then
                failwithf "cannot find PlanDefinition with %s" clinicIdentifier

            let planDefinition =
                planDefinitionBundle.Entry.[0].Resource :?> PlanDefinition

            let activityDefinition =
                (planDefinition.Action
                 |> Seq.find (fun a -> a.TriggerDefinition.Count > 0))
                    .Definition

            for qe in questionnaireBundle.Entry do
                let questionnaire = qe.Resource :?> Questionnaire

                let section =
                    PAT.FHIR.Questions.QuestionSectionType.GetQuestionnaireIdentifierSectionType(
                        questionnaire.Identifier |> Seq.exactlyOne
                    )

                if section.IsSome then // ignore old section types ("Patient")
                    FHIR.QuestionnaireResponses.create CR answerHardcoded patient nurse doctor encounter questionnaire

            // context
            let context =
                {
                    FHIR.CarePlans.SampleContext.patient = fst patient
                    encounter = encounter
                    planDefinition = planDefinition
                    activityDefinitionRef = activityDefinition

                    practitionerGP = doctor
                    careteamForPharmacists = FHIR.CareTeam.create CR patient "Pharmacists" "46255001" pharmacist
                }

            let careplans = FHIR.CarePlans.makeCarePlans context

            let createdCareplan =
                Utils.createResources fhir careplans |> Seq.head

            FHIR.DocumentReference.create CR patient encounter createdCareplan
            |> ignore

            FHIR.Task.create CR patient encounter createdCareplan
            |> ignore

            FHIR.Provenance.create CR doctor careplans
            |> ignore

            FHIR.ReferralRequest.create CR patient doctor pharmacist encounter
            |> ignore

    let gpmpAnswered =
        let patient = patientsFromCSV.[1]

        let encounter =
            FHIR.Encounter.create CR (NeedsSubclinicSelection false) (IsFinished true) patient nurse

        let clinicGuid = "13885b18-d54c-4ce1-ba4c-4e2509c9fabf" // GPMP
        let clinicIdentifier = sprintf "identifier=%s" clinicGuid

        let questionnaireBundle =
            fhir.Search<Questionnaire>([| clinicIdentifier |])

        if questionnaireBundle.Entry.Count = 0 then
            failwithf "cannot find Questionnaire with %s" clinicIdentifier

        let planDefinitionBundle =
            fhir.Search<PlanDefinition>([| clinicIdentifier |])

        if planDefinitionBundle.Entry.Count <> 1 then
            failwithf "cannot find PlanDefinition with %s" clinicIdentifier

        let planDefinition =
            planDefinitionBundle.Entry.[0].Resource :?> PlanDefinition

        let activityDefinition =
            (planDefinition.Action
             |> Seq.find (fun a -> a.TriggerDefinition.Count > 0))
                .Definition

        let procedures =
            FHIR.Procedure.create CR answerAll patient nurse doctor encounter planDefinition

        for qe in questionnaireBundle.Entry do
            let questionnaire = qe.Resource :?> Questionnaire

            let section =
                PAT.FHIR.Questions.QuestionSectionType.GetQuestionnaireIdentifierSectionType(
                    questionnaire.Identifier |> Seq.exactlyOne
                )

            if section.IsSome then // ignore old section types ("Patient")
                FHIR.QuestionnaireResponses.create CR answerAll patient nurse doctor encounter questionnaire


        let context =
            {
                FHIR.CarePlans.SampleContext.patient = fst patient
                encounter = encounter
                planDefinition = planDefinition
                activityDefinitionRef = activityDefinition

                practitionerGP = doctor
                careteamForPharmacists = FHIR.CareTeam.create CR patient "Pharmacists" "46255001" pharmacist
            }

        let careplans = FHIR.CarePlans.makeCarePlans context
        let createdCareplans = Utils.createResources fhir careplans
        let createdCareplan1 = createdCareplans.Head

        FHIR.DocumentReference.create CR patient encounter createdCareplan1
        |> ignore

        FHIR.Task.create CR patient encounter createdCareplan1
        |> ignore

        FHIR.Provenance.create CR doctor createdCareplans
        |> ignore

        FHIR.ReferralRequest.create CR patient doctor pharmacist encounter
        |> ignore

    let gpmpUnanswered =
        let patient = patientsFromCSV.[2]

        let encounter =
            FHIR.Encounter.create CR (NeedsSubclinicSelection true) (IsFinished true) patient nurse

        let clinicIdentifier = sprintf "identifier=%s" gpmpClinicGuid

        let questionnaireBundle =
            fhir.Search<Questionnaire>([| clinicIdentifier |])

        if questionnaireBundle.Entry.Count = 0 then
            failwithf "cannot find Questionnaire with %s" clinicIdentifier

        let planDefinitionBundle =
            fhir.Search<PlanDefinition>([| clinicIdentifier |])

        if planDefinitionBundle.Entry.Count <> 1 then
            failwithf "cannot find PlanDefinition with %s" clinicIdentifier

        let planDefinition =
            planDefinitionBundle.Entry.[0].Resource :?> PlanDefinition

        let activityDefinition =
            (planDefinition.Action
             |> Seq.find (fun a -> a.TriggerDefinition.Count > 0))
                .Definition

        for qe in questionnaireBundle.Entry do
            let questionnaire = qe.Resource :?> Questionnaire

            let section =
                PAT.FHIR.Questions.QuestionSectionType.GetQuestionnaireIdentifierSectionType(
                    questionnaire.Identifier |> Seq.exactlyOne
                )

            if section.IsSome then // ignore old section types ("Patient")
                FHIR.QuestionnaireResponses.create CR answerNone patient null doctor encounter questionnaire


    //deleteAll "TITLES"
    //deleteAll "PASTHISTORY"
    //deleteAll "PATIENTS"
    //deleteAll "USERS"
    //insertTitleCodes()
    //insertPatients()
    //insertPatientsFromBogus (100)
    //insertStaff()

    // get patient

    // add patient encounter


    0
