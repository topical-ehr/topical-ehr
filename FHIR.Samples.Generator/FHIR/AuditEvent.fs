module PAT.Samples.Generator.FHIR.AuditEvent

open System

open Hl7.Fhir.Model

open PAT.Samples.Generator.Utils
open PAT.FHIR.DotNetUtils


let create (CR: CreateResource) =

    let bytes (str: string) = System.Text.Encoding.UTF8.GetBytes str

    let pwdReset =
        AuditEvent(
            Type = Coding("https://fhir.patsoftware.com.au/audit-event", "user-password-reset"),
            Recorded = N DateTimeOffset.UtcNow,
            Outcome = N AuditEvent.AuditEventOutcome.N4,
            OutcomeDesc = "user is locked",
            Agent =
                L [ AuditEvent.AgentComponent(
                        Role = L [ CodeableConcept("https://fhir.patsoftware.com.au/audit-role", "logged-in-user") ],
                        Requestor = N true,
                        Who = ResourceReference("Practitioner/admin"),
                        Extension =
                            L [ Extension("https://fhir.patsoftware.com.au/useragent", FhirString("Mozilla/..."))
                                Extension(
                                    "https://fhir.patsoftware.com.au/session-id-hash",
                                    FhirString("5d9474c0309b7ca09a182d888f73b37a8fe1362c")
                                ) ]
                    ) ],
            Entity =
                L [ AuditEvent.EntityComponent(
                        What = ResourceReference("Practitioner/123"),
                        Detail =
                            L [ AuditEvent.DetailComponent(Type = "newVersionId", Value = Base64Binary(bytes "123")) ]
                    ) ]
        )

    let query =
        AuditEvent(
            Type = Coding("http://hl7.org/fhir/audit-event-type", "rest"),
            Subtype = L [ Coding("http://hl7.org/fhir/restful-interaction", "search") ],
            Action = N AuditEvent.AuditEventAction.E,
            Recorded = N DateTimeOffset.UtcNow,
            Outcome = N AuditEvent.AuditEventOutcome.N0,
            Agent =
                L [ AuditEvent.AgentComponent(
                        Role = L [ CodeableConcept("https://fhir.patsoftware.com.au/audit-role", "logged-in-user") ],
                        Requestor = N true,
                        Who = ResourceReference("Practitioner/doctor"),
                        Network =
                            AuditEvent.NetworkComponent(
                                Address = "1.2.3.4",
                                Type = N AuditEvent.AuditEventAgentNetworkType.N2
                            ),
                        Extension =
                            L [ Extension("https://fhir.patsoftware.com.au/useragent", FhirString("Mozilla/..."))
                                Extension(
                                    "https://fhir.patsoftware.com.au/session-id-hash",
                                    FhirString("5d9474c0309b7ca09a182d888f73b37a8fe1362c")
                                ) ]
                    ) ],
            Entity = L [ AuditEvent.EntityComponent(Query = bytes "Patients?name=a") ]
        )

    let update =
        AuditEvent(
            Type = Coding("http://hl7.org/fhir/audit-event-type", "rest"),
            Subtype = L [ Coding("http://hl7.org/fhir/restful-interaction", "update") ],
            Action = N AuditEvent.AuditEventAction.U,
            Recorded = N DateTimeOffset.UtcNow,
            Outcome = N AuditEvent.AuditEventOutcome.N0,
            Agent =
                L [ AuditEvent.AgentComponent(
                        Role = L [ CodeableConcept("https://fhir.patsoftware.com.au/audit-role", "logged-in-user") ],
                        Requestor = N true,
                        Who = ResourceReference("Practitioner/doctor"),
                        Network =
                            AuditEvent.NetworkComponent(
                                Address = "1.2.3.4",
                                Type = N AuditEvent.AuditEventAgentNetworkType.N2
                            ),
                        Extension =
                            L [ Extension("https://fhir.patsoftware.com.au/useragent", FhirString("Mozilla/..."))
                                Extension(
                                    "https://fhir.patsoftware.com.au/session-log-id",
                                    FhirString("5d9474c0309b7ca09a182d888f73b37a8fe1362c")
                                ) ]
                    ) ],
            Entity = L [ AuditEvent.EntityComponent(What = ResourceReference("Encounter/456")) ]
        )


    CR pwdReset |> ignore
    CR query |> ignore
    CR update |> ignore
