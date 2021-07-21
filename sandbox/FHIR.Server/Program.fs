module FHIR.Server.App

open System
open System.IO
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Cors.Infrastructure
open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Hosting
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.Logging
open Microsoft.Extensions.DependencyInjection
open FSharp.Control.Tasks
open Giraffe

// ---------------------------------
// Models
// ---------------------------------

type Message = { Text: string }

// ---------------------------------
// Views
// ---------------------------------

module Views =
    open Giraffe.ViewEngine

    let layout (content: XmlNode list) =
        html [] [
            head [] [
                title [] [ encodedText "FHIR.Server" ]
                link [ _rel "stylesheet"
                       _type "text/css"
                       _href "/main.css" ]
            ]
            body [] content
        ]

    let partial () = h1 [] [ encodedText "FHIR.Server" ]

    let index (model: Message) =
        [
            partial ()
            p [] [ encodedText model.Text ]
        ]
        |> layout

// ---------------------------------
// Web app
// ---------------------------------

module SampleApp =

    let indexHandler (name: string) =
        let greetings = sprintf "Hello %s, from Giraffe!" name
        let model = { Text = greetings }
        let view = Views.index model
        htmlView view

    let webApp =
        choose [ GET
                 >=> choose [ route "/" >=> indexHandler "world"
                              routef "/hello/%s" indexHandler ]
                 setStatusCode 404 >=> text "Not Found" ]

module FhirEndpoint =

    let jsonOptions =
        let opts = SystemTextJson.Serializer.DefaultOptions
        opts.PropertyNamingPolicy <- System.Text.Json.JsonNamingPolicy.CamelCase
        opts

    let postHandler (resourceType, id) =
        fun (next: HttpFunc) (ctx: HttpContext) ->
            task {
                let! resource = ctx.BindJsonAsync<Data.FhirResource>()

                printfn "JSON serializer: %s" (ctx.GetJsonSerializer().GetType().FullName)

                let dbg =
                    (sprintf
                        "input resource %s/%s version=%s (%s)"
                        resource.ResourceType
                        resource.Id
                        resource.Meta.VersionId
                        resource.Meta.LastUpdated)

                let ser =
                    System.Text.Json.JsonSerializer.Serialize(resource, jsonOptions)

                printfn "serialized again to %s" ser
                return! text dbg next ctx
            }


    let webApp : HttpHandler =
        choose [ POST >=> choose [ routef "/%s/%s" postHandler ]
                 setStatusCode 404 >=> text "Not Found" ]

// ---------------------------------
// Error handler
// ---------------------------------

let errorHandler (ex: Exception) (logger: ILogger) =
    logger.LogError(ex, "An unhandled exception has occurred while executing the request.")

    clearResponse
    >=> setStatusCode 500
    >=> text ex.Message

// ---------------------------------
// Config and Main
// ---------------------------------

let configureCors (builder: CorsPolicyBuilder) =
    builder
        .WithOrigins("http://localhost:5000", "https://localhost:5001")
        .AllowAnyMethod()
        .AllowAnyHeader()
    |> ignore

let configureApp (app: IApplicationBuilder) =
    let env =
        app.ApplicationServices.GetService<IWebHostEnvironment>()

    let mainApp =
        choose [ subRoute "/sample" SampleApp.webApp
                 subRoute "/fhir" FhirEndpoint.webApp ]

    (match env.IsDevelopment() with
     | true -> app.UseDeveloperExceptionPage()
     | false -> app.UseGiraffeErrorHandler(errorHandler))
        .UseCors(configureCors)
        .UseStaticFiles()
        .UseGiraffe(mainApp)

let configureServices (services: IServiceCollection) =
    services.AddCors() |> ignore
    services.AddGiraffe() |> ignore

    // Optionally use `FSharp.SystemTextJson` (requires `FSharp.SystemTextJson` package reference)
    // serializationOptions.Converters.Add(JsonFSharpConverter(JsonUnionEncoding.FSharpLuLike))
    // Now register SystemTextJson.Serializer
    services.AddSingleton<Json.ISerializer>(SystemTextJson.Serializer(FhirEndpoint.jsonOptions))
    |> ignore

let configureLogging (builder: ILoggingBuilder) =
    builder.AddConsole().AddDebug() |> ignore

[<EntryPoint>]
let main args =
    let contentRoot = Directory.GetCurrentDirectory()
    let webRoot = Path.Combine(contentRoot, "WebRoot")

    Host
        .CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(fun webHostBuilder ->
            webHostBuilder
                .UseContentRoot(contentRoot)
                .UseWebRoot(webRoot)
                .Configure(Action<IApplicationBuilder> configureApp)
                .ConfigureServices(configureServices)
                .ConfigureLogging(configureLogging)
            |> ignore)
        .Build()
        .Run()

    0
