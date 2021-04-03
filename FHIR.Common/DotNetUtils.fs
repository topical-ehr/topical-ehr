module PAT.FHIR.DotNetUtils

open System

open Hl7.Fhir.Rest
open Hl7.Fhir.Model

open PAT.FHIR.Urls
open PAT.FHIR.Codes

////////////////////////////////////////////
// FHIR.NET object construction helpers
////////////////////////////////////////////

let makeStaticIdentifier identifier =
    let system = patFhirUrl "static-identifiers"
    Identifier(System=system, Value=identifier)

let makeUuidIdentifier (g: Guid) =
    let value = sprintf "urn:uuid:%s" (g.ToString())
    let identifier = Identifier(System="urn:ietf:rfc:3986", Value=value)
//    if not (String.IsNullOrEmpty description) then
//        identifier.Type <- CodeableConcept(Text=description)
    identifier

let referenceForExpression exp =
    ResourceReference(Reference=exp)

let expressionForIdentifier (r:DomainResource) (i:Identifier) =
    sprintf "%s?identifier=%s|%s" r.TypeName i.System i.Value

let referenceToUuidIdentifier (r:DomainResource) (g:Guid) =
    //let exp = sprintf "%s?identifier=urn:uuid|%s" r.TypeName (g.ToString())
    //ResourceReference(Reference=exp)
    ResourceReference(Identifier = makeUuidIdentifier g)

let identifierToFhirGuid (identifier:Identifier) =
    let namespaceGuid = Guid("f41e529e-4551-46fe-875d-ffd554e88bbd");
    let v5guid = V5Guid.makeV5Guid namespaceGuid (sprintf "%s|%s" identifier.System identifier.Value)
    "urn:uuid:" + v5guid.ToString()

let referenceToBundleUuid (g:Guid) =
    ResourceReference(Reference = sprintf "urn:uuid:%s" (g.ToString()))

let referenceToBundleIdentifier (identifier: Identifier) =
    if identifier.System = "urn:ietf:rfc:3986" then
        if not <| identifier.Value.StartsWith("urn:uuid:") then
            failwithf "identifier missing urn:uuid: prefix: %s" identifier.Value
        ResourceReference(Reference = identifier.Value)
    else
        ResourceReference(Reference = identifierToFhirGuid identifier)

let referenceToBundleIdentifierWithDisplay (display:string) (identifier:Identifier) =
    ResourceReference(Display=display, Reference = identifierToFhirGuid identifier)

let referenceToUuid (r:DomainResource) (g:Guid) =
    let exp = sprintf "%s?identifier=urn:ietf:rfc:3986|%s" r.TypeName (g.ToString())
    ResourceReference(Reference=exp)

let referenceToIdentifier identifier =
    ResourceReference(Identifier = identifier)

let referenceToStaticIdentifier (r:DomainResource) (identifier) =
    ResourceReference(Identifier = makeStaticIdentifier identifier)

let referenceToResource (r:Resource) =
    if r = null then
        null
    else
        if String.IsNullOrWhiteSpace r.Id then failwithf "referenceToResource: blank id for %s - has it been created?" r.TypeName
        let ref = sprintf "%s/%s" r.TypeName r.Id
        ResourceReference(Reference=ref)


////////////////////////////////////////////
// Filter helpers
////////////////////////////////////////////

let hasCoding (targetCoding: Coding) (manyCodings: CodeableConcept seq) =
    manyCodings |> Seq.exists(
        fun code ->
            code.Coding |> Seq.exists (
                fun coding -> coding.System = targetCoding.System && coding.Code = targetCoding.Code
            )
    )


////////////////////////////////////////////
// Search helpers
////////////////////////////////////////////
type FhirClient with
    member client.SearchAllPages(url: string) =

        let nextLink (bundle: Bundle) =
            if bundle = null || bundle.Link = null || bundle.NextLink = null then
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
            | None -> [entries]
            | Some nextLink ->
                let nextEntries = doSearch nextLink
                [entries] @ nextEntries


        let results = doSearch url
        results |> Seq.collect id

////////////////////////////////////////////
// Shortcuts for converting from F# to some standard .NET types
////////////////////////////////////////////

let N = Nullable
type L<'T> = ResizeArray<'T>
let flatten x = Seq.collect id x |> ResizeArray

// Helper for upcasting sequences (TODO: better way??)
let toResources (s:'T seq when 'T :> Resource) : Resource seq =
    s |> Seq.map (fun x -> x :> Resource)


let makeFhirClient (timeoutMilliseconds: int) (fhirEndpointUrl: string) =
    let client = FhirClient(fhirEndpointUrl, verifyFhirVersion = false (*FIXME*)) // not planning to dispose..
    client.PreferredFormat <- ResourceFormat.Json
    client.Timeout <- timeoutMilliseconds

    // let token = ""
    // client.OnBeforeRequest.Add(
    //     fun req -> req.RawRequest.Headers.Add("Authorization", sprintf "Bearer %s" token))
    client

let setTag (r: Resource) (tag: Coding) =
        
    if r.Meta <> null then
        r.Meta.Tag.RemoveAll( fun c -> c.System = tag.System) |> ignore
        r.Meta.Tag.Add(tag)
    else
        r.Meta <- Meta(Tag = L [tag])

let getResourceIdentifier (resource: Resource) =
    // unfortunately FHIR's Identifier field is not on the Resource/DomainResource type
    //   so we use reflection to get at it.. (better way?)
    let prop = resource.GetType().GetProperty("Identifier")
    let value = prop.GetValue(resource)
    let identifier = match value with
                        | :? seq<Identifier> as collection ->
                            if Seq.length collection <> 1 then
                                failwithf "Resource with multiple Identifiers (%s)" resource.TypeName
                            Seq.head collection
                        | :? Identifier as i -> i
                        | _ -> failwithf "Resource without Identifier (%s)" resource.TypeName
    identifier


type ImportedResourcesListArgs = {
    clinicsPackageId: string
    clinicsPackageTitle: string
    resources: Resource seq
}

let makeImportedResourcesList (args: ImportedResourcesListArgs) =
    
    let entries =
        args.resources |> Seq.map (fun r ->
            let identifier = getResourceIdentifier r
            List.EntryComponent(
                Item = referenceToBundleIdentifier identifier
            )
        )

    List(
        Code = PatCodes.List.Infrastructure.ImportedResourcesList,
        Identifier = L [
            PatCodes.List.Infrastructure.ClinicsPackage args.clinicsPackageId
        ],
        Title = args.clinicsPackageTitle,
        Entry = L entries,
        DateElement = FhirDateTime.Now(),
        Status = N List.ListStatus.Current,
        Mode = N ListMode.Working
    )

let getFullUrlBasedOnIdentifier (identifier: Identifier) =
    let fullUrl =
        if identifier.System = "urn:ietf:rfc:3986" then
            if not <| identifier.Value.StartsWith("urn:uuid:") then
                failwithf "identifier missing urn:uuid: prefix: %s" identifier.Value
            identifier.Value
        else
            identifierToFhirGuid identifier
    fullUrl

let makeUpdatesBundle (tags: Coding list) (resources: Resource seq) =
    let bundleEntries =
        resources
        |> Seq.map (fun r ->

                    r.Meta <- Meta(Tag = L tags)

                    let identifier = getResourceIdentifier r
                    let fullUrl = getFullUrlBasedOnIdentifier identifier
                      
                    Bundle.EntryComponent(
                        FullUrl = fullUrl,
                        Resource = r,
                        // Conditional update: http://build.fhir.org/http.html#cond-update
                        Request = Bundle.RequestComponent(
                            Method = N Bundle.HTTPVerb.PUT, // this updates or creates
                            Url = (sprintf "%s?identifier=%s|%s" r.TypeName identifier.System identifier.Value)
                        )
                        
                    ))
                     
    let bundle = Bundle(
                    Type = N Bundle.BundleType.Batch, // TODO: change back to Transaction after solving excessive size errors
                    Entry = L bundleEntries
    )

    bundle