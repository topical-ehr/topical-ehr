module PAT.Samples.Generator.FHIR.Contacts

open Hl7.Fhir.Model
open PAT.FHIR.DotNetUtils
open PAT.FHIR.Extensions
open PAT.Samples.Generator.Utils
open FSharp.Data


[<Literal>]
let private OccupationsDataFilename = "occupationsData.json"

type OccupationsFormat = JsonProvider<OccupationsDataFilename>

let occupations =
    OccupationsFormat.Load(OccupationsDataFilename)


let insertOrganizationsFromBogus (createResource: CreateResource) =
    let faker = Bogus.Faker()

    for occupation in occupations do
        // occupations that start with A --> 1 contact, B --> 2 contacts, etc
        let count =
            (occupation.Occupation.ToUpper().Chars(0) |> int)
            - (int 'A')
            + 1

        let snomedCode = occupation.Code.JsonValue.AsString()

        for i in [ 0 .. count ] do

            let organization =
                Organization(
                    Name =
                        faker.Company.CompanyName()
                        + " "
                        + occupation.Occupation.Replace('_', ' '),
                    Address =
                        L [ Hl7.Fhir.Model.Address(
                                Type = N Address.AddressType.Postal,
                                Line = [ faker.Address.StreetAddress() ],
                                City = faker.Address.City(),
                                PostalCode = faker.Address.ZipCode()
                            )
                            Hl7.Fhir.Model.Address(
                                Type = N Address.AddressType.Postal,
                                Line = [ faker.Address.StreetAddress() ]
                            ) ],
                    Telecom =
                        L [ ContactPoint(
                                System = N Hl7.Fhir.Model.ContactPoint.ContactPointSystem.Email,
                                Value = faker.Person.Email
                            )
                            ContactPoint(
                                System = N Hl7.Fhir.Model.ContactPoint.ContactPointSystem.Phone,
                                Value = faker.Person.Phone
                            )
                            ContactPoint(
                                System = N Hl7.Fhir.Model.ContactPoint.ContactPointSystem.Phone,
                                Value = faker.Person.Phone,
                                Rank = N 1
                            )
                            ContactPoint(
                                System = N Hl7.Fhir.Model.ContactPoint.ContactPointSystem.Phone,
                                Value = faker.Person.Phone,
                                Rank = N 10
                            )
                            ContactPoint(
                                System = N Hl7.Fhir.Model.ContactPoint.ContactPointSystem.Sms,
                                Value = faker.Person.Phone
                            )
                            ContactPoint(
                                System = N Hl7.Fhir.Model.ContactPoint.ContactPointSystem.Pager,
                                Value = faker.Person.Phone
                            ) ],
                    Active =
                        (if i = 0 then
                             Option.toNullable None
                         else
                             N true),
                    Identifier =
                        L [ Identifier(
                                Value = "123",
                                System = PatExtensions.Urls.PRACTICE_SOFTWARE_INTERNAL_ID,
                                Type =
                                    (if i = 0 then
                                         null
                                     else
                                         CodeableConcept("https://hl7.org/fhir/v2/0203", "MR", "INTERNALID"))
                            ) ]
                )
                :> Resource
                |> createResource

            let role =
                HealthcareService(
                    ProvidedBy = ResourceReference(sprintf "Organization/%s" organization.Id),
                    Active = N true,
                    Type = L [ CodeableConcept("http://snomed.info/sct", snomedCode, occupation.Occupation) ],
                    Identifier =
                        L [ Identifier(
                                Value = "456",
                                System = PatExtensions.Urls.PRACTICE_SOFTWARE_INTERNAL_ID,
                                Type =
                                    (if i = 0 then
                                         null
                                     else
                                         CodeableConcept("https://hl7.org/fhir/v2/0203", "MR", "INTERNALID"))
                            ) ]
                )
                :> Resource
                |> createResource

            ()



let insertPractitionersFromBogus (createResource: CreateResource) =
    let faker = Bogus.Faker()
    let sample = Bogus.Person()

    for occupation in occupations do
        // occupations that start with A --> 1 contact, B --> 2 contacts, etc
        let count =
            (occupation.Occupation.ToUpper().Chars(0) |> int)
            - (int 'A')
            + 1

        let snomedCode = occupation.Code.JsonValue.AsString()

        for i in [ 0 .. count ] do

            let gender =
                if i = 0 then
                    Option.toNullable None
                else
                    N(
                        if faker.Random.Bool() then
                            AdministrativeGender.Male
                        else
                            AdministrativeGender.Female
                    )


            let practitioner =
                Practitioner(
                    Name =
                        L [ HumanName(
                                Use = (N HumanName.NameUse.Official),
                                Given = [ faker.Name.FirstName() ],
                                Family = faker.Name.LastName()
                            ) ],
                    Address =
                        L [ Hl7.Fhir.Model.Address(
                                Type = N Address.AddressType.Postal,
                                Line = [ sample.Address.Street ],
                                City = sample.Address.City,
                                PostalCode = sample.Address.ZipCode
                            )
                            Hl7.Fhir.Model.Address(
                                Type = N Address.AddressType.Postal,
                                Line = [ sample.Address.Street ]
                            ) ],
                    Telecom =
                        L [ ContactPoint(
                                System = N Hl7.Fhir.Model.ContactPoint.ContactPointSystem.Email,
                                Value = faker.Person.Email
                            )
                            ContactPoint(
                                System = N Hl7.Fhir.Model.ContactPoint.ContactPointSystem.Phone,
                                Value = faker.Person.Phone
                            )
                            ContactPoint(
                                System = N Hl7.Fhir.Model.ContactPoint.ContactPointSystem.Phone,
                                Value = faker.Person.Phone,
                                Rank = N 1
                            )
                            ContactPoint(
                                System = N Hl7.Fhir.Model.ContactPoint.ContactPointSystem.Phone,
                                Value = faker.Person.Phone,
                                Rank = N 10
                            )
                            ContactPoint(
                                System = N Hl7.Fhir.Model.ContactPoint.ContactPointSystem.Sms,
                                Value = faker.Person.Phone
                            )
                            ContactPoint(
                                System = N Hl7.Fhir.Model.ContactPoint.ContactPointSystem.Pager,
                                Value = faker.Person.Phone
                            ) ],
                    Gender = gender,
                    Active =
                        (if i = 0 then
                             Option.toNullable None
                         else
                             N true),
                    Qualification =
                        L [ Practitioner.QualificationComponent(
                                Code = CodeableConcept("http://snomed.info/sct", snomedCode, occupation.Occupation)
                            ) ],
                    Identifier =
                        L [ Identifier(
                                Value = "123",
                                System = PatExtensions.Urls.PRACTICE_SOFTWARE_INTERNAL_ID,
                                Type =
                                    (if i = 0 then
                                         null
                                     else
                                         CodeableConcept("https://hl7.org/fhir/v2/0203", "MR", "INTERNALID"))
                            ) ]
                )
                :> Resource
                |> createResource


            let role =
                PractitionerRole(
                    Practitioner = ResourceReference(sprintf "Practitioner/%s" practitioner.Id),
                    Active = N true,
                    Code = L [ CodeableConcept("http://snomed.info/sct", snomedCode, occupation.Occupation) ]
                )
                :> Resource
                |> createResource

            ()
