module NextEHR.FHIR.DotNetUtils

open System

open Hl7.Fhir.Rest
open Hl7.Fhir.Model

////////////////////////////////////////////
// FHIR.NET object construction helpers
////////////////////////////////////////////

let makeUuidIdentifier (g: Guid) =
    Identifier(System = "urn:ietf:rfc:3986", Value = sprintf "urn:uuid:%s" (g.ToString()))

let referenceForExpression exp = ResourceReference(Reference = exp)

let expressionForIdentifier (r: DomainResource) (i: Identifier) =
    sprintf "%s?identifier=%s|%s" r.TypeName i.System i.Value

let referenceToUuidIdentifier (r: DomainResource) (g: Guid) =
    ResourceReference(Identifier = makeUuidIdentifier g)

let referenceToUuid (r: DomainResource) (g: Guid) =
    let exp =
        sprintf "%s?identifier=urn:ietf:rfc:3986|%s" r.TypeName (g.ToString())

    ResourceReference(Reference = exp)

let referenceToIdentifier identifier =
    ResourceReference(Identifier = identifier)

let referenceToResource (r: Resource) =
    if r = null then
        null
    else
        if String.IsNullOrWhiteSpace r.Id then
            failwithf "referenceToResource: blank id for %s - has it been created?" r.TypeName

        let ref = sprintf "%s/%s" r.TypeName r.Id
        ResourceReference(Reference = ref)

let canonicalUrlForResource (r: Resource) = r.TypeName + "/" + r.Id

////////////////////////////////////////////
// Filter helpers
////////////////////////////////////////////

let hasCoding (targetCoding: Coding) (manyCodings: CodeableConcept seq) =
    manyCodings
    |> Seq.exists
        (fun code ->
            code.Coding
            |> Seq.exists
                (fun coding ->
                    coding.System = targetCoding.System
                    && coding.Code = targetCoding.Code))


////////////////////////////////////////////
// Search helpers
////////////////////////////////////////////
type FhirClient with

    member client.SearchAllPages(url: string) =

        let nextLink (bundle: Bundle) =
            if bundle = null
               || bundle.Link = null
               || bundle.NextLink = null then
                None
            else
                let nextLink = bundle.NextLink
                let relativeUrl = nextLink.PathAndQuery.TrimStart('/')
                Some relativeUrl

        let rec doSearch (url: string) =
            let bundle =
                try
                    client.Get(url) :?> Bundle
                with exn ->
                    let msg = sprintf "DoSearch failed for %s" url
                    raise <| Exception(msg, exn)

            let entries = bundle.Entry

            match nextLink bundle with
            | None -> [ entries ]
            | Some nextLink ->
                let nextEntries = doSearch nextLink
                [ entries ] @ nextEntries


        let results = doSearch url
        results |> Seq.collect id

////////////////////////////////////////////
// Shortcuts for converting from F# to some standard .NET types
////////////////////////////////////////////

let N = Nullable

type L<'T> = ResizeArray<'T>
let flatten x = Seq.collect id x |> ResizeArray

// Helper for upcasting sequences (TODO: better way??)
let toResources (s: 'T seq when 'T :> Resource) : Resource seq = s |> Seq.map (fun x -> x :> Resource)


let makeFhirClient (timeoutMilliseconds: int) (fhirEndpointUrl: string) =
    let client = new FhirClient(fhirEndpointUrl)

    client.Settings.PreferredFormat <- ResourceFormat.Json
    client.Settings.Timeout <- timeoutMilliseconds

    // let token = ""
    // client.OnBeforeRequest.Add(
    //     fun req -> req.RawRequest.Headers.Add("Authorization", sprintf "Bearer %s" token))
    client

let setTag (r: Resource) (tag: Coding) =

    if r.Meta <> null then
        r.Meta.Tag.RemoveAll(fun c -> c.System = tag.System)
        |> ignore

        r.Meta.Tag.Add(tag)
    else
        r.Meta <- Meta(Tag = L [ tag ])
