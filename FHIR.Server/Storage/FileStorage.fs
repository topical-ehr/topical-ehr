module FHIR.Server.Storage.FileStorage

open System.IO
open System.Net
open System.Text.RegularExpressions

open FHIR.Server.Data

open Types


type FileStorage(rootDir: DirectoryInfo) =

    let filePath (resourceId: ResourceId) =
        let re = Regex("""([A-Z]([0-9]+))+""")
        let matches = re.Matches(resourceId.Id)
        // matches.[0].Captures

        Path.Join(rootDir.FullName, resourceId.ResourceType, "test")

    interface IStorage with
        member this.Read resourceId = 5
