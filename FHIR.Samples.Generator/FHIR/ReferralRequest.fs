module PAT.Samples.Generator.FHIR.ReferralRequest

open System
open Hl7.Fhir.Model
open PAT.Samples.Generator.Utils
open PAT.FHIR.DotNetUtils
open PAT.FHIR.Extensions

let create (createResource:CreateResource) ((patient:Patient),_) (doctor:Practitioner) (recipient:Practitioner) (encounter:Encounter) =

    let resources = seq {
        yield ReferralRequest(
            Subject = referenceToResource patient,
            Context = referenceToResource encounter,
            Requester = ReferralRequest.RequesterComponent(Agent = referenceToResource doctor),
            Recipient = L[referenceToResource recipient],

            Extension = L[Extension(PatExtensions.Urls.ReferralRequest.SecretToken, FhirString "notsecret92874591837134")],

            AuthoredOnElement = FhirDateTime.Now(),
            Status = N RequestStatus.Active,
            Intent = N RequestIntent.Plan
        )
    }

    resources |> Seq.map createResource |> Seq.toList
