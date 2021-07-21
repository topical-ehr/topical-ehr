module FHIR.Server.Data

open System.Text.Json
open System.Text.Json.Serialization
open System.Collections.Generic

type FhirMeta() =
    member val VersionId = "" with get, set
    member val LastUpdated = "" with get, set

    [<JsonExtensionDataAttribute>]
    member val ExtensionData = Dictionary<string, obj>() with get, set

type FhirResource() =
    member val ResourceType = "" with get, set
    member val Id = "" with get, set
    member val Meta = FhirMeta() with get, set

    [<JsonExtensionDataAttribute>]
    member val ExtensionData = Dictionary<string, obj>() with get, set

type ResourceParser(json: string) =

    let resource = JsonSerializer.Deserialize(json)

    member val Resource = resource
