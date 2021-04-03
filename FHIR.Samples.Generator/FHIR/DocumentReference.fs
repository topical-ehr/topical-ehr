module PAT.Samples.Generator.FHIR.DocumentReference

open System
open Hl7.Fhir.Model
open PAT.FHIR.DotNetUtils

let create createResource ((patient: Resource), _) (encounter: Resource) (carePlan: Resource) =
    let bytes =
        System.Text.UTF8Encoding.UTF8.GetBytes("document contents")

    let r =
        DocumentReference(
            Subject = referenceToResource patient,
            Status = N DocumentReferenceStatus.Current,
            DocStatus = N CompositionStatus.Final,
            Type = CodeableConcept("http://loinc.org", "18776-5", "Plan of care note", "GPMP (example!)"),
            Date = N DateTimeOffset.Now,
            Author = L [ referenceToResource patient ],
            Description = "PAT Management Plan",
            Content =
                L [ DocumentReference.ContentComponent(
                        Attachment = Attachment(ContentType = "application/pdf", Data = bytes)
                    ) ],
            Context =
                DocumentReference.ContextComponent(
                    Encounter = L [ referenceToResource encounter ],
                    Related = L [ referenceToResource carePlan ]
                )

        )

    createResource r
