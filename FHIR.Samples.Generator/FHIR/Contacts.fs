module NextEHR.Samples.Generator.FHIR.Contacts

open FSharp.Data
open Hl7.Fhir.Model

open NextEHR.FHIR.DotNetUtils
open NextEHR.Samples.Generator.Utils


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
                        L [ Address(
                                Type = N Address.AddressType.Postal,
                                Line = [ faker.Address.StreetAddress() ],
                                City = faker.Address.City(),
                                PostalCode = faker.Address.ZipCode()
                            )
                            Address(Type = N Address.AddressType.Postal, Line = [ faker.Address.StreetAddress() ]) ],
                    Telecom =
                        L [ ContactPoint(System = N ContactPoint.ContactPointSystem.Email, Value = faker.Person.Email)
                            ContactPoint(System = N ContactPoint.ContactPointSystem.Phone, Value = faker.Person.Phone)
                            ContactPoint(
                                System = N ContactPoint.ContactPointSystem.Phone,
                                Value = faker.Person.Phone,
                                Rank = N 1
                            )
                            ContactPoint(
                                System = N ContactPoint.ContactPointSystem.Phone,
                                Value = faker.Person.Phone,
                                Rank = N 10
                            )
                            ContactPoint(System = N ContactPoint.ContactPointSystem.Sms, Value = faker.Person.Phone)
                            ContactPoint(System = N ContactPoint.ContactPointSystem.Pager, Value = faker.Person.Phone) ],
                    Active =
                        (if i = 0 then
                             Option.toNullable None
                         else
                             N true)
                )
                :> Resource
                |> createResource

            let role =
                HealthcareService(
                    ProvidedBy = ResourceReference(sprintf "Organization/%s" organization.Id),
                    Active = N true,
                    Type = L [ CodeableConcept("http://snomed.info/sct", snomedCode, occupation.Occupation) ]
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
                        L [ Address(
                                Type = N Address.AddressType.Postal,
                                Line = [ sample.Address.Street ],
                                City = sample.Address.City,
                                PostalCode = sample.Address.ZipCode
                            )
                            Address(Type = N Address.AddressType.Postal, Line = [ sample.Address.Street ]) ],
                    Telecom =
                        L [ ContactPoint(System = N ContactPoint.ContactPointSystem.Email, Value = faker.Person.Email)
                            ContactPoint(System = N ContactPoint.ContactPointSystem.Phone, Value = faker.Person.Phone)
                            ContactPoint(
                                System = N ContactPoint.ContactPointSystem.Phone,
                                Value = faker.Person.Phone,
                                Rank = N 1
                            )
                            ContactPoint(
                                System = N ContactPoint.ContactPointSystem.Phone,
                                Value = faker.Person.Phone,
                                Rank = N 10
                            )
                            ContactPoint(System = N ContactPoint.ContactPointSystem.Sms, Value = faker.Person.Phone)
                            ContactPoint(System = N ContactPoint.ContactPointSystem.Pager, Value = faker.Person.Phone) ],
                    Gender = gender,
                    Active =
                        (if i = 0 then
                             Option.toNullable None
                         else
                             N true),
                    Qualification =
                        L [ Practitioner.QualificationComponent(
                                Code = CodeableConcept("http://snomed.info/sct", snomedCode, occupation.Occupation)
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
