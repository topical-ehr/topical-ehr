module FHIR.Server.Storage.Types

open System.Net

open FHIR.Server.Data


type ResourceId =
    {
        ResourceType: string
        Id: string
        VersionId: string option
    }

type IStorage =
    abstract Read : ResourceId -> FhirResource
    abstract Update : ResourceId -> FhirResource -> FhirResource
    abstract Create : FhirResource -> FhirResource
    abstract Delete : ResourceId -> HttpStatusCode
