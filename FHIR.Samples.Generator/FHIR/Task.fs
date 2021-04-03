module PAT.Samples.Generator.FHIR.Task

open System
open Hl7.Fhir.Model
open Hl7.Fhir.Support
open PAT.FHIR.DotNetUtils
open PAT.FHIR.Codes

let create createResource ((patient: Resource),_) (encounter: Resource) (carePlan: Resource) =
    let bytes = System.Text.UTF8Encoding.UTF8.GetBytes("document contents")

    let t =
        Task(
            Code = PatCodes.Task.Code.CareplanRtfImport,
            Status = N Task.TaskStatus.Received,
            BusinessStatus = PatCodes.Task.BusinessStatus.FileAdded,
            Intent = N RequestIntent.Order,
            For = referenceToResource patient,
            Focus = referenceToResource carePlan,
            Context = referenceToResource encounter,
            AuthoredOn = DateTime.UtcNow.ToFhirDateTime(),
            LastModified = DateTime.UtcNow.ToFhirDateTime(),
            Input = L [
                Task.ParameterComponent(
                    Type = PatCodes.Task.Input.HL7RTF,
                    Value = FhirString("document will go here"))
            ]
        )


    createResource t
    
    