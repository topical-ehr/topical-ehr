import React from "react";
import * as FHIR from "@topical-ehr/fhir-types";
import { CandleLiteWrapper } from "@topical-ehr/fhir-server-in-browser/CandleLite";

export interface FhirServerConfigData {
    server:
        | {
              type: "candlelite";
              filename: string;
              initialSnapshotUrl: string;
          }
        | {
              type: "http";
              baseUrl: string;
          };
}

export const FhirServerConfigContext = React.createContext<FhirServerConfigData | null>(null);

export function useFhirServerConfig() {
    return React.useContext(FhirServerConfigContext)!; // !: assume TopicsContext is set to reduce null checks..
}

export async function fhirUp({ server }: FhirServerConfigData) {
    async function init() {
        if (server.type === "http") {
            return {
                async doRequest(method: string, fhirUrl: string, body?: string) {
                    const url = fhirUrl ? server.baseUrl + "/" + fhirUrl : server.baseUrl;
                    const response = await fetch(url, {
                        method,
                        body,
                        headers: body
                            ? {
                                  "content-type": "application/fhir+json",
                              }
                            : {},
                    });

                    const json = await response.text();
                    const headers = [...response.headers.entries()];
                    return { json, status: response.status, headers };
                },
            };
        } else if (server.type === "candlelite") {
            await navigator.storage.persist();

            const candlelite = await new CandleLiteWrapper(server.filename);

            const exists = await candlelite.Exists();
            if (!exists) {
                console.info("loading initial snapshot");
                await candlelite.LoadDbSnapshot(server.initialSnapshotUrl);
            }

            return {
                async doRequest(method: string, fhirUrl: string, body?: string) {
                    const response = await candlelite.Request(method, fhirUrl, body ?? "");
                    return {
                        json: response.body,
                        status: response.status,
                        headers: Object.entries(response?.headers ?? {}),
                    };
                },
                async loadSnapshot(url: string) {
                    return await candlelite.LoadDbSnapshot(url);
                },
                async clearAll() {
                    return await candlelite.ClearAll();
                },
                async export() {
                    return await candlelite.Export();
                },
                async exportAsDownload() {
                    const array = await candlelite.Export();
                    const blob = new Blob([array.buffer], { type: "application/x-sqlite3" });
                    const a = document.createElement("a");
                    document.body.appendChild(a);
                    a.href = window.URL.createObjectURL(blob);
                    a.download = server.filename;
                    a.addEventListener("click", function () {
                        setTimeout(function () {
                            window.URL.revokeObjectURL(a.href);
                            a.remove();
                        }, 500);
                    });
                    a.click();
                },
            };
        }
        throw new Error(`invalid server type: ${JSON.stringify(server)}`);
    }

    const methods = await init();

    return {
        config: server,
        ...methods,
        async fetch(path: string) {
            const response = await methods.doRequest("GET", path);
            return JSON.parse(response.json);
        },

        async post(bundle: FHIR.Bundle<FHIR.Resource>) {
            const body = JSON.stringify(bundle, null, 2);
            const response = await methods.doRequest("POST", "", body);
            return JSON.parse(response.json);
        },

        async put(resource: FHIR.Resource) {
            const body = JSON.stringify(resource, null, 2);
            const response = await methods.doRequest("PUT", `${resource.resourceType}/${resource.id}`, body);
            return JSON.parse(response.json);
        },

        async delete(resource: FHIR.Resource) {
            const body = JSON.stringify(resource, null, 2);
            await methods.doRequest("DELETE", `${resource.resourceType}/${resource.id}`, body);
        },
    };
}

export type FhirServerMethods = Awaited<ReturnType<typeof fhirUp>>;
