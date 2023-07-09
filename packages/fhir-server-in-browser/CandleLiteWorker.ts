import * as Comlink from "comlink";

import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

import { CandleLiteServer } from "@topical-ehr/candlelite/CandleLite.Core/Server";
import { defaultParametersMap } from "@topical-ehr/candlelite/CandleLite.Core/SearchParameters";
import { JsJSON } from "@topical-ehr/candlelite/JsJSON";
import { JsSQLiteImpl } from "@topical-ehr/candlelite/JsSQLite";

export class CandleLiteWrapper {
    loadCandlelite: Promise<any>;

    constructor(public dbFilename: string) {
        this.loadCandlelite = new Promise((resolve, reject) => {
            sqlite3InitModule({
                print: console.log,
                printErr: console.error,
            })
                .then((sqlite3) => {
                    try {
                        const server = this.createServer(sqlite3);
                        resolve({ server, sqlite3 });
                    } catch (err) {
                        reject(err);
                    }
                })
                .catch(reject);
        });
    }

    createServer(sqlite3) {
        const vfs = "opfs";

        function getDbClass() {
            if (vfs === "opfs") {
                const klass = sqlite3.oo1.OpfsDb;
                if (!klass) {
                    alert("Error: OPFS is not available on this web browser, please try Chrome/Firefox");
                }
                console.log("using opfs");
                return klass;
            } else {
                return sqlite3.oo1.DB;
            }
        }

        console.log("Opening sqlite db", {
            vfs,
            filename: this.dbFilename,
            sqlite_version: sqlite3.capi.sqlite3_libversion(),
            sqlite_sourceid: sqlite3.capi.sqlite3_sourceid(),
        });
        const dbClass = getDbClass();
        const db = new dbClass("/" + this.dbFilename, "ct");

        const dbImpl = new JsSQLiteImpl(db, sqlite3);

        const config = {
            SearchParameters: defaultParametersMap,
            CurrentDateTime: new Date(),
        };

        const server = new CandleLiteServer(config, dbImpl, new JsJSON(true));
        console.log("CandleLite Server created");
        // server.SetLogDestination("http://localhost:10000/logs/candlelite.js");
        return server;
    }

    async Request(method: string, path: string, body: string) {
        const { server } = await this.loadCandlelite;

        let headers: Record<string, string> = {};
        function getHeader() {
            return "";
        }
        function setHeader(name: string, value: string) {
            headers[name] = value;
        }

        let resp = (server as any).HandleRequest(method, "/fhir/" + path, "/fhir/", body, getHeader, setHeader);

        console.log(resp);

        return { status: resp.Status as number, body: resp.BodyString as string, headers };
    }

    async Exists() {
        const dir = await navigator.storage.getDirectory();
        // @ts-ignore
        for await (const [key, value] of dir.entries()) {
            if (key === this.dbFilename) {
                console.log("db exists in OPFS", this.dbFilename);
                return true;
            }
        }

        console.log("db doesn't exist in OPFS", this.dbFilename);
        return false;
    }

    async ClearAll() {
        const dir = await navigator.storage.getDirectory();
        const names: string[] = [];
        // @ts-ignore
        for await (const [key, value] of dir.entries()) {
            names.push(key);
        }

        for (const name of names) {
            console.log("deleting", { name });
            dir.removeEntry(name, { recursive: true });
        }

        return false;
    }

    async LoadDbSnapshot(url: string) {
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(`LoadDbSnapshot failed (HTTP ${resp.status})`);
        }
        const arrayBuffer = await resp.arrayBuffer();
        console.log("loaded snapshot", { url, size: arrayBuffer.byteLength });

        const { sqlite3 } = await this.loadCandlelite;

        // https://sqlite.org/wasm/doc/trunk/cookbook.md

        sqlite3.capi.sqlite3_js_vfs_create_file("opfs", this.dbFilename, arrayBuffer);
        console.log("written snapshot", { url, size: arrayBuffer.byteLength });
        return;

        const p = sqlite3.wasm.allocFromTypedArray(arrayBuffer);
        const db = new sqlite3.oo1.DB();
        const rc = sqlite3.capi.sqlite3_deserialize(
            db.pointer,
            "main", //this.dbFilename,
            p,
            arrayBuffer.byteLength,
            arrayBuffer.byteLength,
            sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
            // Optionally:
            // | sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE
        );
        console.log("sqlite3_deserialize", { rc });
        db.checkRc(rc);
    }

    async Export() {
        const { sqlite3 } = await this.loadCandlelite;

        const db = new sqlite3.oo1.OpfsDb(this.dbFilename, "ct");
        const byteArray = sqlite3.capi.sqlite3_js_db_export(db) as Uint8Array;
        console.log("exported", { bytes: byteArray.byteLength });
        return byteArray;
    }
}

// https://sqlite.org/wasm/doc/trunk/index.md

Comlink.expose(CandleLiteWrapper);
