module PAT.Samples.Generator.FHIR.Procedure
open PAT.Samples.Generator.Utils
open Hl7.Fhir.Model
open PAT.FHIR.DotNetUtils

let create (createResource:CreateResource) answerFraction ((patient:Patient),_) (nurse:Practitioner) (doctor:Practitioner) (encounter:Encounter) (plan:PlanDefinition) =

    let procedures = seq {
        yield Procedure(
            Subject = referenceToResource patient,
            Context = referenceToResource encounter,
            Performer = L [Procedure.PerformerComponent(Actor=referenceToResource patient)],
            Status = N EventStatus.Completed,
            Definition = L[referenceToResource plan],

            Performed = Period(StartElement=FhirDateTime(2017,10,20)),
            Code = CodeableConcept("system - TODO", "ddaa3be9-6dd3-489b-9e83-b0693c4d5689", "Smoking education")
        )
        yield Procedure(
            Subject = referenceToResource patient,
            Context = referenceToResource encounter,
            Performer = L [Procedure.PerformerComponent(Actor=referenceToResource patient)],
            Status = N EventStatus.Completed,
            Definition = L[referenceToResource plan],
            Category = CodeableConcept(Text="PAT Patient Education"),

            Performed = Period(StartElement=FhirDateTime(2017,10,20), EndElement=FhirDateTime(2017,10,20)),
            Code = CodeableConcept("system - TODO", "ddaa3be9-6dd3-489b-9e83-b0693c4d5689", "Smoking education")
        )

    }

    procedures |> Seq.map createResource |> Seq.toList
