module PAT.Samples.Generator.FHIR.Provenance

open System
open Hl7.Fhir.Model

open PAT.Samples.Generator.Utils
open PAT.FHIR.DotNetUtils


let create (createResource: CreateResource) (practitioner: Practitioner) (targets: #Resource list) =

    let resources = seq {
        yield Provenance(
            Target = (targets |> Seq.map referenceToResource |> L),
            Agent = L[Provenance.AgentComponent(Who = referenceToResource (practitioner))],

            Reason = L[Coding("http://hl7.org/fhir/v3/ActReason", "CAREMGT")],

            Recorded = N DateTimeOffset.UtcNow
        )
    }

    resources |> Seq.map createResource |> Seq.toList
