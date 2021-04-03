module PAT.Samples.Generator.FHIR.Practitioners

open System
open Hl7.Fhir.Support
open Hl7.Fhir.Model
open Hl7.Fhir.Rest
open PAT.FHIR.DotNetUtils
open PAT.FHIR.Codes
open PAT.FHIR.Questions
open PAT.FHIR.Extensions
open PAT.Samples.Generator.Utils


let create (createResource:CreateResource) givenName familyName occupationCode =
    let practitioner =
        Practitioner(
            Name = L [HumanName(Given=[givenName], Family=familyName)],
            Active = N true,
            Qualification = L [ Practitioner.QualificationComponent(Code=occupationCode) ]
        ) :> Resource |> createResource

    let practitionerRole =
        PractitionerRole(
            Practitioner = referenceToResource practitioner,
            Active = N true,
            Identifier = L [
                Identifier(
                    System = "http://ns.electronichealth.net.au/id/medicare-provider-number",
                    Value = "1234567890",
                    Type = CodeableConcept(
                            Coding=L [Coding("http://hl7.org/fhir/v2/0203", "PRN", "Provider number")],
                            Text = "Medicare Provider Number" )
                    )
            ],
            Code = L [ occupationCode ]
        ) :> Resource |> createResource
    printfn "Creating PractitionerRole/%s" practitionerRole.Id
            
    practitioner :?> Practitioner

let createAdmin createResource =
    let created = create createResource "Super" "Admin" KnownCodes.OccupationsSNOMED.Receptionist
    created

let createDoctor createResource =
    let created = create createResource "Alex" "Lee" KnownCodes.OccupationsSNOMED.MedicalDoctor
    created

let createPharmacist CR =
    create CR "Ivy" "Sarkar" KnownCodes.OccupationsSNOMED.Pharmacist


let createNurse createResource =
    create createResource "Robin" "Night" KnownCodes.OccupationsSNOMED.Nurse