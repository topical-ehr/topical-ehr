module NextEHR.Samples.Generator.Main

open System

open Hl7.Fhir.Rest
open Hl7.Fhir.Model

open NextEHR.FHIR.Utils
open NextEHR.FHIR.Codes


let recreatePatients CR fhir =
    [ "Patient" ] |> Utils.deleteResources fhir

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

    patientsFromCSV


[<EntryPoint>]
let main argv =
    printfn "NextEHR.Samples.Generator: args: %A" argv
    let haveArg arg = Array.contains arg argv

    let getEnv =
        Environment.GetEnvironmentVariable >> Option.ofObj

    Bogus.Randomizer.Seed <- Random(7777777)

    let fhirEndpointUrl =
        getEnv "FHIR_BASE_URL"
        |> Option.defaultValue "http://localhost:8080/fhir/"

    let fhir = new FhirClient(fhirEndpointUrl)
    fhir.Settings.PreferredFormat <- ResourceFormat.Json
    fhir.Settings.ParserSettings.AcceptUnknownMembers <- true // FIXME: remove once figure out what's going on
    fhir.Settings.ParserSettings.AllowUnrecognizedEnums <- true

    let CR (resource: #Resource) =
        printfn "Creating resource %s..." (resource.TypeName)
        let start = System.Diagnostics.Stopwatch()
        start.Start()
        let created = fhir.Create(resource)
        //printfn " done in %d ms" start.ElapsedMilliseconds
        created

    let DR (resourceType: string) (criteria: string []) =
        Utils.findAndDelete fhir criteria resourceType

    let patientsFromCSV = recreatePatients CR fhir

    FHIR.Contacts.insertPractitionersFromBogus CR
    FHIR.Contacts.insertOrganizationsFromBogus CR

    if haveArg "--deleteSamples" then

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

        Utils.deleteResources fhir toDelete

        [ "Practitioner"; "PractitionerRole" ]
        |> Utils.deleteResources fhir


    let doctor = FHIR.Practitioners.createDoctor CR
    let nurse = FHIR.Practitioners.createNurse CR
    let admin = FHIR.Practitioners.createAdmin CR
    let pharmacist = FHIR.Practitioners.createPharmacist CR

    0
