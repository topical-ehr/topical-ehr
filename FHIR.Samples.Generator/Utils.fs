module PAT.Samples.Generator.Utils

let rand = new System.Random()

let swap (a: _ []) x y =
    let tmp = a.[x]
    a.[x] <- a.[y]
    a.[y] <- tmp

let shuffle a =
    Array.iteri (fun i _ -> swap a i (rand.Next(i, Array.length a))) a

open Hl7.Fhir.Model
open Hl7.Fhir.Rest
open PAT.FHIR.DotNetUtils
open PAT.FHIR.Codes


let createResource (client: FhirClient) (resource: #Resource) =
    resource.Meta <- Meta(Tag = L [ PatCodes.Tags.PatVersion ])
    client.Create(resource)

let createResources (client: FhirClient) (resources: #Resource seq) =
    resources
    |> Seq.map (createResource client)
    |> Seq.toList

//type CreateResource<'R when 'R :> Resource> = 'R -> 'R
type CreateResource = Resource -> Resource
type DeleteResource = string -> string [] -> unit

let findAndDelete (fhirClient: FhirClient) (searchCriteria: string array) (resourceType: string) =
    let deleteBundled (bundle: Bundle) =
        for entry in bundle.Entry do
            fhirClient.Delete(sprintf "%s/%s" entry.Resource.TypeName entry.Resource.Id)

    printfn "Deleting %s" resourceType

    let mutable found =
        fhirClient.Search(resourceType, searchCriteria) //, summary = N SummaryType.True

    while found <> null
          && found.Total.HasValue
          && found.Total.Value > 0 do
        deleteBundled found
        found <- fhirClient.Search(resourceType, searchCriteria)

let deleteResources (fhirClient: FhirClient) (onlyDeleteSamples: bool) resourceTypesToDelete =

    let searchCriteria =
        if onlyDeleteSamples then
            [|
                "_tag=https://metadata.patsoftware.com.au/v3.0/FHIR/tags/SampleData|true"
            |]
        else
            [||]

    resourceTypesToDelete
    |> List.iter (findAndDelete fhirClient searchCriteria)
