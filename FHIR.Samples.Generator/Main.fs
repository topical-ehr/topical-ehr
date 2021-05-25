module NextEHR.Samples.Generator.Main

open System

open Hl7.Fhir.Rest
open Hl7.Fhir.Model

open Argu


let recreatePatients CR fhir =
    [ "Patient" ] |> Utils.deleteResources fhir

    let count = 10

    for index in Seq.init count id do
        if index % 1000 = 0 then
            printfn "insertPatientsFromBogus: inserting patient %d" index

        let patient = FHIR.Patients.createFromBogus CR

        if index < 5 then
            // FHIR.Observation.create CR patient |> ignore

            ()

    let patientsFromCSV =
        FHIR.Patients.createPatientsFromCSV CR
        |> Seq.toList

    patientsFromCSV


let getEnv =
    Environment.GetEnvironmentVariable >> Option.ofObj

let fhirBaseUrlDefault =
    getEnv "FHIR_BASE_URL"
    |> Option.defaultValue "http://localhost:8080/fhir/"

type CommandLineArguments =
    | [<Unique>] FhirBase of url: string
    | [<Unique>] Seed of int

    | DeleteAll
    | RecreatePatients
    | AddContacts
    | AddPractitioners

    interface IArgParserTemplate with
        member s.Usage =
            match s with
            | FhirBase _ -> sprintf "FHIR base URL (default %s)" fhirBaseUrlDefault
            | Seed _ -> "seed for random number generator"

            | DeleteAll _ -> "delete all resources"
            | RecreatePatients _ -> "delete all patients and re-create samples"
            | AddContacts _ -> "add contacts"
            | AddPractitioners _ -> "add practitioners"



[<EntryPoint>]
let main argv =
    printfn "NextEHR.Samples.Generator: args: %A" argv

    let parser =
        ArgumentParser.Create<CommandLineArguments>()

    let args = parser.Parse argv

    Bogus.Randomizer.Seed <-
        Random(
            args.TryGetResult Seed
            |> Option.defaultValue 7777777
        )

    let fhir =
        new FhirClient(
            args.TryGetResult FhirBase
            |> Option.defaultValue fhirBaseUrlDefault
        )

    fhir.Settings.PreferredFormat <- ResourceFormat.Json
    fhir.Settings.ParserSettings.AcceptUnknownMembers <- true // FIXME: remove once figure out what's going on
    fhir.Settings.ParserSettings.AllowUnrecognizedEnums <- true

    /// CreateResource
    let CR (resource: #Resource) =
        printf "Created %s/" (resource.TypeName)
        let start = System.Diagnostics.Stopwatch()
        start.Start()
        let created = fhir.Create(resource)
        printfn "%s in %d ms" created.Id start.ElapsedMilliseconds
        created

    /// DeleteResource
    let DR (resourceType: string) (criteria: string []) =
        Utils.findAndDelete fhir criteria resourceType

    for arg in args.GetAllResults() do
        match arg with
        | DeleteAll ->
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
            |> Utils.deleteResources fhir

            [ "Practitioner"; "PractitionerRole" ]
            |> Utils.deleteResources fhir

        | RecreatePatients ->
            let patientsFromCSV = recreatePatients CR fhir
            ()

        | AddContacts ->
            FHIR.Contacts.insertPractitionersFromBogus CR
            FHIR.Contacts.insertOrganizationsFromBogus CR

        | AddPractitioners ->

            let doctor = FHIR.Practitioners.createDoctor CR
            let nurse = FHIR.Practitioners.createNurse CR
            let admin = FHIR.Practitioners.createAdmin CR
            let pharmacist = FHIR.Practitioners.createPharmacist CR
            ()

        | FhirBase _
        | Seed _ -> ()

    0
