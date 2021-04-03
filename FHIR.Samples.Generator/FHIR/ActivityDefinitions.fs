module PAT.Samples.Generator.FHIR.ActivityDefinitions

open System

open Hl7.Fhir.Model

open PAT.Samples.Generator.Utils
open PAT.FHIR.DotNetUtils
open PAT.FHIR.Codes

type DynamicValue = ActivityDefinition.DynamicValueComponent

type CustomGoalInfo =
    {
        name: string
        goal: string
        plan: string
        uuid: string

        basedOn: ActivityDefinition option
        autoReplaceDerivedFrom: bool
        useWithClinics: PlanDefinition list
        author: Practitioner
        priv: bool
        dateModified: DateTime
    }

let createCustomGoal
    (createResource: CreateResource)
    (deleteResource: DeleteResource)
    (goal: CustomGoalInfo)
    (autoReplaceFor: Practitioner)
    =

    deleteResource "ActivityDefinition" [| "identifier=" + goal.uuid |]

    let activity =
        ActivityDefinition(
            Identifier = L [ PatCodes.ActivityDefinition.Identifiers.CustomGoal goal.uuid ],
            Name = goal.name,
            Title = goal.name,
            Status = N PublicationStatus.Active,
            Date = goal.dateModified.ToString(),
            Kind = N ActivityDefinition.RequestResourceType.CarePlan,
            Extension =
                L [ if goal.autoReplaceDerivedFrom then
                        yield PatCodes.ActivityDefinition.Extensions.UseAutomaticallyFor autoReplaceFor
                    yield PatCodes.ActivityDefinition.Extensions.Private goal.priv ],
            RelatedArtifact = L [],
            UseContext = L []
        )

    goal.basedOn
    |> Option.iter
        (fun basedOn ->
            activity.RelatedArtifact.Add(
                RelatedArtifact(
                    Type = N RelatedArtifact.RelatedArtifactType.DerivedFrom,
                    Resource = "ActivityDefinition/" + basedOn.Id
                )
            ))

    for clinic in goal.useWithClinics do
        let clinicUUID = clinic.Identifier.[0].Value

        activity.UseContext.Add(
            UsageContext(
                Code = PatCodes.ActivityDefinition.UsageContext.UseWithClinicCode,
                Value = PatCodes.ActivityDefinition.UsageContext.UseWithClinic clinic.Title clinicUUID
            )
        )


    activity.DynamicValue <-
        L [ DynamicValue(Path = "description", Expression = Expression(Expression_ = goal.goal))
            DynamicValue(Path = "note", Expression = Expression(Expression_ = goal.plan)) ]

    createResource activity
