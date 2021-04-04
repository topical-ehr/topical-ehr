module NextEHR.Samples.Generator.FHIR.Patients

open System

open FSharp.Data
open Bogus.DataSets

open Hl7.Fhir.Support
open Hl7.Fhir.Model

open NextEHR.FHIR.Utils
open NextEHR.Samples.Generator
open NextEHR.Samples.Generator.Utils
open NextEHR.FHIR.Codes


type PatientsCsvFormat = CsvProvider<"patients.csv">
let patients = PatientsCsvFormat.Load("patients.csv")

type ConditionsCsvFormat = CsvProvider<"conditions.csv">

let conditions =
    ConditionsCsvFormat.Load("conditions.csv").Rows
    |> Seq.map (fun c -> c.Condition)

let getConditionsFor (patient: Patient) =
    let patientId =
        patient.Identifier
        |> Seq.find (fun i -> i.Type.Coding.[0].Code = "MR")

    let rand =
        new System.Random(Convert.ToInt32(patientId.Value))

    let numConditions = rand.Next(0, 6)

    let conditions =
        conditions
        |> Seq.take numConditions
        |> Seq.toArray

    Utils.shuffle (conditions)
    conditions

let createCondition createResource (patient: Resource) (condition: string) =

    let resource =
        Condition(
            ClinicalStatus = ConditionCodes.ClinicalStatus.Active,
            VerificationStatus = ConditionCodes.VerificationStatus.Confirmed,
            Subject = referenceToResource patient,
            Code = (CodeableConcept(Text = condition)),
            Note = L [ Annotation(Text = Markdown(sprintf "comment for %s" condition)) ]
        )

    let a = Annotation()
    createResource resource

let createConditions createResource (patient: Resource) =
    seq {
        let conditions = getConditionsFor (patient :?> Patient)

        for condition in conditions do
            yield createCondition createResource patient condition
    }

let create (sample: Bogus.Person) patientId gender prefix firstName lastName middleName medicareNo medicareLineNo =

    let patientIdentifier =
        Identifier(
            Value = patientId.ToString(),
            System = "urn:oid:1.2.36.146.595.217.0.1",
            Type = CodeableConcept("https://hl7.org/fhir/v2/0203", "MR", "Best Practice INTERNALID")
        )

    // Medicare - see http://fhir.hl7.org.au/smart-on-fhir/profiles/profile-medicare/
    let medicareString =
        //  10 digits or 11 digits if with IRN digit
        [
            medicareNo
            medicareLineNo
            |> Option.map (fun i -> i.ToString())
        ]
        |> List.map (fun so -> so |> Option.defaultValue "")
        |> String.concat ""

    let medicarePeriod =
        Period(EndElement = FhirDateTime(2018, 2)) |> Some

    let medicareId =
        if medicareString.Length > 1 then
            Identifier(
                System = "http://ns.electronichealth.net.au/id/hi/mc",
                Value = medicareString,
                Period = (medicarePeriod |> Option.toObj),
                Type =
                    CodeableConcept(
                        Coding = L [ Coding("http://hl7.org/fhir/v2/0203", "MC", "Patient's Medicare Number") ],
                        Text = "Medicare Number"
                    )
            )
            |> Some
        else
            None

    let getFullTextName (components: List<string option>) =
        let strings =
            components
            |> List.collect Option.toList
            |> List.filter (fun s -> s.Length > 0)

        String.Join(" ", strings)

    let nameOfficial =
        HumanName(
            Use = (N HumanName.NameUse.Official),
            Prefix = (prefix |> Option.toList),
            Given =
                ([ Some firstName; middleName ]
                 |> List.map Option.toList
                 |> List.collect id),
            Family = lastName,
            Text =
                (getFullTextName [ Some firstName
                                   middleName
                                   Some lastName ])
        )

    let nameUsual =
        HumanName(Use = (N HumanName.NameUse.Usual), Text = firstName)

    let toFhirContactPoint
        (value: string option)
        (useType: ContactPoint.ContactPointUse option)
        (system: ContactPoint.ContactPointSystem)
        (preferred: bool)
        =
        match value with
        | Some value ->
            let c =
                ContactPoint(System = N system, Value = value)

            Option.iter (fun x -> c.Use <- N x) useType
            if preferred then c.Rank <- N 1
            Some c
        | None -> None

    let contactPoints =
        [
            toFhirContactPoint
                (Some sample.Phone)
                (Some ContactPoint.ContactPointUse.Home)
                ContactPoint.ContactPointSystem.Phone
                true
            toFhirContactPoint
                (Some sample.Phone)
                (Some ContactPoint.ContactPointUse.Mobile)
                ContactPoint.ContactPointSystem.Phone
                false
            toFhirContactPoint
                (Some sample.Phone)
                (Some ContactPoint.ContactPointUse.Work)
                ContactPoint.ContactPointSystem.Phone
                false
            toFhirContactPoint (Some sample.Email) None ContactPoint.ContactPointSystem.Email true
            ContactPoint(System = N ContactPoint.ContactPointSystem.Other)
            |> Some
        ]

    let address =
        Address(
            Type = N Address.AddressType.Postal,
            Line = [ sample.Address.Street ],
            City = sample.Address.City,
            PostalCode = sample.Address.ZipCode
        )

    let addressNoCity =
        Address(Type = N Address.AddressType.Postal, Line = [ sample.Address.Street ])

    let addressNoLine =
        Address(Type = N Address.AddressType.Postal, City = sample.Address.City, PostalCode = sample.Address.ZipCode)

    let patient =
        Patient(
            Identifier =
                ([ medicareId; Some patientIdentifier ]
                 |> List.map Option.toList
                 |> List.collect id
                 |> L),
            Name = L [ nameOfficial; nameUsual ],
            BirthDate = DateExtensions.ToFhirDate(sample.DateOfBirth),
            Gender =
                N(
                    match gender with
                    | Name.Gender.Male -> AdministrativeGender.Male
                    | Name.Gender.Female -> AdministrativeGender.Female
                    | _ -> failwithf "invalid gender value %A" gender
                ),
            Telecom =
                L(
                    contactPoints
                    |> List.map Option.toList
                    |> List.collect id
                ),
            Address =
                L [ address
                    addressNoCity
                    addressNoLine ],
            Active = N true
        )

    patient

let createFromBogus (createResource: CreateResource) =
    let sample = Bogus.Person()
    let random = Bogus.Randomizer()
    let faker = Bogus.Faker()

    let medicareNo =
        random.ReplaceNumbers("##########") |> Some

    let medicareLineNo = random.ReplaceNumbers("#") |> Some

    let gender = faker.PickRandom<Name.Gender>()
    let prefix = faker.Name.Prefix(N gender) |> Some
    let firstName = faker.Name.FirstName(N gender)
    let lastName = faker.Name.LastName(N gender)
    let middleName = faker.Name.FirstName(N gender) |> Some

    let patientId = random.Number(100)

    let resource =
        create sample patientId gender prefix firstName lastName middleName medicareNo medicareLineNo

    createResource resource :?> Patient

let createPatientsFromCSV (createResource: CreateResource) =
    seq {
        let sample = Bogus.Person()
        let random = Bogus.Randomizer()

        for pt in patients.Rows do

            let medicareNo =
                random.ReplaceNumbers("##########") |> Some

            let medicareLineNo = random.ReplaceNumbers("#") |> Some

            let gender =
                match pt.Gender with
                | "F" -> Name.Gender.Female
                | "M" -> Name.Gender.Male
                | _ -> failwithf "invalid gender field: %s" (pt.Gender)

            let prefix = None
            let firstName = pt.FirstName
            let lastName = pt.LastName + pt.PatientID.ToString()
            let middleName = None
            let patientId = pt.PatientID
            sample.DateOfBirth <- pt.DOB

            let resource =
                create sample patientId gender prefix firstName lastName middleName medicareNo medicareLineNo

            let created = createResource resource :?> Patient

            let conditions =
                createConditions createResource created
                |> Seq.toList

            yield (created, conditions)
    }
